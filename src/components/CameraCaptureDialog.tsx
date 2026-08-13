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
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-[9999] bg-black overflow-hidden pointer-events-auto"
        >
          {/* Video Feed (Full Screen) */}
          <div className="absolute inset-0 flex items-center justify-center">
            {error ? (
              <div className="text-white text-center p-6 bg-red-500/20 liquid-glass border-glass-border rounded-2xl max-w-sm mx-4 z-20">
                <p className="mb-4">{error}</p>
                <Button className="w-full rounded-xl" onClick={onClose} variant="secondary">
                  Voltar
                </Button>
              </div>
            ) : (
              <>
                {isStarting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20 backdrop-blur-sm">
                    <Loader2 className="size-10 text-primary animate-spin" />
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-opacity duration-500 ${isStarting ? 'opacity-0' : 'opacity-100'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
              </>
            )}
          </div>

          {/* Vignette Overlay for better UI contrast */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_120%)] z-10" />

          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full liquid-glass border-glass-border shadow-lg text-white hover:text-white transition-transform active:scale-95"
              onClick={onClose}
            >
              <X className="size-6" />
            </Button>
            
            <div className="liquid-glass px-5 py-2 rounded-full text-xs font-semibold tracking-wide text-white/90 border-glass-border flex items-center gap-2 shadow-lg">
              <div className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              CÂMERA
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full liquid-glass border-glass-border shadow-lg text-white hover:text-white transition-transform active:scale-95"
              onClick={toggleCamera}
            >
              <RefreshCcw className="size-5" />
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 inset-x-0 h-48 flex flex-col items-center justify-center z-20 pb-8 bg-gradient-to-t from-black/80 to-transparent">
            <button
              onClick={handleCapture}
              disabled={!!error || isStarting}
              className="group relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] shadow-lg shadow-purple-500/30 transition-transform active:scale-90 hover:scale-105 border-[6px] border-background/20 disabled:opacity-50"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] blur opacity-60" />
              <div className="absolute inset-2 rounded-full bg-white transition-transform group-hover:scale-95 shadow-inner" />
            </button>
            <span className="mt-6 text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">Tirar Foto</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
