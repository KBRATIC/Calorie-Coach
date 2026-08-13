import { useState, useRef, useEffect, useCallback } from "react";
import { X, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";

import { createPortal } from "react-dom";

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export function CameraCaptureDialog({ open, onClose, onCapture }: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setIsStarting(true);
      setError(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError") {
        setError("Permissão da câmera negada. Libere o acesso nas configurações do navegador.");
      } else {
        setError("Não foi possível acessar a câmera do dispositivo.");
      }
    } finally {
      setIsStarting(false);
    }
  }, [facingMode]);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, facingMode]); // Depend on facingMode so it restarts when flipped

  const toggleCamera = () => {
    setFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  const handleCapture = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw image flipped if using user camera
        if (facingMode === "user") {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(base64);
        onClose();
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: "10%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "10%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col"
        >
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/30 text-white hover:bg-black/50 border-none"
              onClick={onClose}
            >
              <X className="size-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/30 text-white hover:bg-black/50 border-none"
              onClick={toggleCamera}
            >
              <RefreshCcw className="size-5" />
            </Button>
          </div>

          {/* Camera Feed */}
          <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
            {error ? (
              <div className="text-white text-center p-6 bg-red-500/20 rounded-xl max-w-sm mx-4">
                <p>{error}</p>
                <Button className="mt-4 w-full" onClick={onClose} variant="secondary">
                  Voltar
                </Button>
              </div>
            ) : (
              <>
                {isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-0">
                    <Loader2 className="size-8 text-white animate-spin" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-300 ${isStarting ? 'opacity-0' : 'opacity-100'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              </>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="h-32 bg-black flex items-center justify-center pb-safe">
            <button
              onClick={handleCapture}
              disabled={!!error || isStarting}
              className="w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 hover:bg-white/10"
            >
              <div className="w-[60px] h-[60px] bg-white rounded-full shadow-lg" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
