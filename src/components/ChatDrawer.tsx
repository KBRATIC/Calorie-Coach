import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, Camera, X, Mic, Paperclip, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { askAssistant } from "@/lib/ai.functions";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CameraCaptureDialog } from "@/components/CameraCaptureDialog";
import { activeDayState } from "@/lib/nutrition";
import { Drawer } from "vaul";

interface Message {
  role: "user" | "model";
  text: string;
  images?: string[];
}

import React from "react";

const LoadingIndicator = () => {
  const steps = [
    "Analisando...",
    "Buscando referências nutricionais...",
    "Calculando macros e porções...",
    "Escrevendo a resposta..."
  ];
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1 < steps.length ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex justify-start"
    >
      <div className="max-w-[85%] rounded-[24px] rounded-bl-sm bg-surface-strong px-5 py-4 text-foreground border border-border shadow-sm">
        <div className="flex gap-3 items-center">
          <div className="flex gap-1.5 items-center shrink-0">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="size-2 rounded-full bg-fuchsia-500" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="size-2 rounded-full bg-purple-500" />
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="size-2 rounded-full bg-blue-500" />
          </div>
          <motion.span 
            key={stepIndex}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground font-medium"
          >
            {steps[stepIndex]}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

const MessageList = React.memo(({ messages, isLoading }: { messages: Message[], isLoading: boolean }) => {
  return (
    <div className="flex flex-col gap-6 pb-6">
      <AnimatePresence initial={false}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`w-fit min-w-[80px] max-w-[85%] rounded-[24px] px-5 py-4 text-[15px] leading-relaxed flex flex-col gap-3 ${
                msg.role === "user"
                  ? "bg-gradient-to-tr from-blue-600 via-purple-600 to-fuchsia-600 text-white rounded-br-sm shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-fuchsia-500/20 border border-white/10"
                  : "bg-surface-strong text-foreground rounded-bl-sm border border-border"
              }`}
            >
              {msg.images && msg.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.images.map((img, i) => (
                    <img key={i} src={img} alt="Enviada pelo usuário" className="max-w-full sm:max-w-[250px] max-h-[300px] object-contain rounded-lg border border-white/10 bg-black/20" />
                  ))}
                </div>
              )}
              
              {msg.role === "model" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-primary break-words">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              ) : (
                msg.text && <span className="break-words">{msg.text}</span>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && <LoadingIndicator />}
      </AnimatePresence>
    </div>
  );
});

const AudioVisualizer = ({ isListening }: { isListening: boolean }) => {
  const [volumes, setVolumes] = useState<number[]>(Array(30).fill(4));
  
  useEffect(() => {
    if (!isListening) return;
    
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let animationFrame: number;
    
    const startAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          const step = Math.max(1, Math.floor(dataArray.length / 30));
          const newVolumes = [];
          for (let i = 0; i < 30; i++) {
            const val = dataArray[i * step] || 0;
            // map 0-255 to 4-32 px
            const height = Math.max(4, (val / 255) * 32);
            newVolumes.push(height);
          }
          setVolumes(newVolumes);
          animationFrame = requestAnimationFrame(update);
        };
        update();
      } catch (err) {
        console.error("Error accessing mic for visualizer:", err);
      }
    };
    
    startAudio();
    
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (audioContext) audioContext.close();
    };
  }, [isListening]);

  return (
    <div className="flex items-center justify-between w-full h-8 gap-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      {volumes.map((h, i) => (
        <motion.div
          key={i}
          animate={{ height: h }}
          transition={{ type: "tween", duration: 0.05, ease: "linear" }}
          className="flex-1 rounded-full bg-gradient-to-t from-fuchsia-500 via-purple-400 to-cyan-400"
          style={{ minWidth: '4px' }}
        />
      ))}
    </div>
  );
};

export function ChatDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Oi! 👋 Sou seu assistente nutricional aqui no KcalTrack. Me conta o que comeu, tira uma foto do prato ou me pergunta qualquer coisa sobre alimentação — tô aqui pra te ajudar! 😊",
    },
  ]);
  const [hasText, setHasText] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ask = useServerFn(askAssistant);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Reconhecimento de voz não suportado neste navegador.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText("");
    };
    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let currentInterim = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        if (inputRef.current) {
          const prev = inputRef.current.value;
          const sep = prev && !prev.endsWith(" ") && !finalTranscript.startsWith(" ") ? " " : "";
          inputRef.current.value = prev + sep + finalTranscript;
          setHasText(inputRef.current.value.trim().length > 0);
        }
      }
      setInterimText(currentInterim);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech error", event.error);
      setIsListening(false);
      setInterimText("");
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognition.start();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, imagePreviews]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1400;
          const MAX_HEIGHT = 1400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.85 quality for better analysis
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const availableSlots = 10 - imageFiles.length;
      const filesToProcess = files.slice(0, availableSlots);
      
      if (files.length > availableSlots) {
        toast.error(`Limite de 10 imagens por mensagem. Apenas ${availableSlots} foram adicionadas.`);
      }

      setImageFiles(prev => [...prev, ...filesToProcess]);
      
      for (const file of filesToProcess) {
        try {
          const compressedBase64 = await compressImage(file);
          setImagePreviews(prev => [...prev, compressedBase64]);
        } catch (error) {
          console.error("Erro ao comprimir imagem:", error);
        }
      }
    }
    // reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const inputValue = inputRef.current?.value || "";
    if ((!inputValue.trim() && imagePreviews.length === 0) || isLoading) return;

    const userMessage = inputValue.trim();
    const imagesToSend = [...imagePreviews];
    
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.style.height = "50px";
    }
    setHasText(false);
    setImageFiles([]);
    setImagePreviews([]);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", text: userMessage, images: imagesToSend.length > 0 ? imagesToSend : undefined },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Gemini API requires the first message to be from the 'user'.
      // If the first message in our state is the default 'model' greeting, we must exclude it.
      const apiMessages = newMessages
        .filter((m, idx) => !(idx === 0 && m.role === "model"))
        .map((m, idx, arr) => {
          // Only send images on the LAST user message to avoid huge payload on follow-ups
          if (m.images && idx !== arr.length - 1) {
            return { ...m, text: m.text || "[imagem enviada anteriormente]", images: undefined };
          }
          return m;
        });
      const response = await ask({ data: { messages: apiMessages, date: activeDayState.date } });
      setMessages((prev) => [...prev, { role: "model", text: response.text }]);
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "";
      const userFacingMessage = errorMessage.includes("limite diário")
        ? errorMessage
        : "Desculpe, ocorreu um erro ao conectar à IA. Tente novamente.";
      setMessages((prev) => [
        ...prev,
        { role: "model", text: userFacingMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Mobile: Enter just inserts a newline.
        return;
      }
      
      if (e.shiftKey) {
        // Desktop: Shift+Enter inserts a newline.
        return;
      }
      
      // Desktop: Enter sends the message.
      e.preventDefault();
      const inputValue = inputRef.current?.value || "";
      if ((inputValue.trim() || imagePreviews.length > 0) && !isLoading) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSend(fakeEvent);
      }
    }
  };

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/80 z-50 transition-opacity" />
          <Drawer.Content 
            onInteractOutside={(e) => {
              if (isCameraOpen) e.preventDefault();
            }}
            className="bg-surface border-t border-border flex flex-col rounded-t-[32px] h-[95vh] fixed bottom-0 left-0 right-0 z-50 mx-auto sm:max-w-3xl outline-none"
          >
            <div className="absolute inset-0 bg-background/40 pointer-events-none -z-10 rounded-t-[32px]" />
            
            <div className="p-4 sm:p-5 border-b border-border shrink-0 bg-surface rounded-t-[32px] flex flex-col items-center">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border mb-4" />
              <Drawer.Title className="flex items-center gap-3 text-xl font-medium tracking-tight w-full px-2">
                <div className="relative flex size-12 items-center justify-center rounded-full shrink-0 shadow-md">
                  <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-blue-600 via-purple-500 to-fuchsia-500 blur-sm animate-spin [animation-duration:4s] opacity-80" />
                  <div className="absolute inset-[2px] bg-black/40 backdrop-blur-[2px] rounded-full z-10 flex items-center justify-center">
                    <Sparkles className="size-5 text-white/90 animate-pulse [animation-duration:3s]" />
                  </div>
                </div>
                KcalTrack Assistant
              </Drawer.Title>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col px-4 pt-4 no-scrollbar" ref={scrollRef}>
              <MessageList messages={messages} isLoading={isLoading} />
            </div>

            <div className="p-3 sm:p-5 flex flex-col gap-3 bg-surface border-t border-border shrink-0">
              <AnimatePresence>
                {imagePreviews.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex gap-2 p-3 border-b border-border/50 bg-background/50 overflow-x-auto"
                  >
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-border" />
                        <button 
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-md hover:scale-110 transition-transform"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, scale: 0.9, height: 0 }}
                    className="mb-2 mx-2 px-4 py-3 bg-black/60 rounded-[32px] border border-fuchsia-500/30 flex flex-col gap-2 relative overflow-hidden backdrop-blur-xl shadow-[0_0_30px_rgba(217,70,239,0.15)]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-fuchsia-600/20 to-purple-600/20 bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]" />
                    <div className="flex flex-col items-center justify-center relative z-10 w-full gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400/80 w-full text-center mb-1">Ouvindo...</span>
                      <AudioVisualizer isListening={isListening} />
                    </div>
                    {interimText && (
                      <p className="text-base text-foreground/90 font-light relative z-10">
                        "{interimText}"
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleSend} className="relative flex items-center gap-2 bg-surface-strong border border-border rounded-[32px] p-1 shadow-inner focus-within:border-fuchsia-500/50 focus-within:shadow-[0_0_15px_rgba(217,70,239,0.1)] transition-all">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="chat-image-upload"
                  name="chat-image-upload"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={`h-12 w-12 rounded-full bg-transparent hover:bg-surface-strong shrink-0 transition-colors active:scale-[0.95] ${imageFiles.length > 0 ? 'text-fuchsia-500' : 'text-muted-foreground hover:text-foreground'}`}
                      disabled={isLoading}
                      aria-label="Anexar arquivo"
                    >
                      <Paperclip className="size-[22px]" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent 
                    side="top" 
                    align="start" 
                    className="w-56 p-2 rounded-3xl bg-surface border-border shadow-2xl mb-4"
                  >
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 rounded-2xl hover:bg-surface-strong h-12"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          fileInputRef.current?.click();
                        }}
                      >
                        <ImagePlus className="size-5 text-indigo-400" />
                        <span className="font-medium">Galeria</span>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 rounded-2xl hover:bg-surface-strong h-12"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          setIsCameraOpen(true);
                        }}
                      >
                        <Camera className="size-5 text-fuchsia-400" />
                        <span className="font-medium">Câmera</span>
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <div className="relative flex-1">
                  <Textarea
                    id="chat-input"
                    name="chat-input"
                    aria-label="Mensagem para o assistente"
                    ref={inputRef}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = '50px';
                      target.style.height = Math.min(target.scrollHeight, 160) + 'px';
                      
                      const currentHasText = target.value.trim().length > 0;
                      if (currentHasText !== hasText) {
                        setHasText(currentHasText);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Como posso te ajudar?"
                    className="pr-24 min-h-[50px] rounded-none py-3.5 resize-none bg-transparent hover:bg-transparent focus:bg-transparent transition-colors border-transparent focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50 text-base sm:text-lg font-light [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    disabled={isLoading}
                    rows={1}
                    style={{ overflowY: 'auto' }}
                  />
                  <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className={`h-10 w-10 rounded-full transition-transform active:scale-[0.95] ${isListening ? "text-destructive animate-pulse bg-destructive/10" : "text-muted-foreground hover:bg-surface-strong hover:text-foreground"}`}
                      onClick={toggleListening}
                      disabled={isLoading}
                      aria-label="Ativar microfone"
                    >
                      <Mic className="size-5" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      className={`h-10 w-10 rounded-full transition-transform active:scale-[0.95] flex-shrink-0 border-0 ${
                        (!hasText && imagePreviews.length === 0) || isLoading 
                          ? 'bg-surface border-border text-muted-foreground' 
                          : 'bg-gradient-to-tr from-blue-600 via-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/25 hover:opacity-90'
                      }`}
                      disabled={(!hasText && imagePreviews.length === 0) || isLoading}
                      aria-label="Enviar mensagem"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    <CameraCaptureDialog 
      open={isCameraOpen} 
      onClose={() => setIsCameraOpen(false)} 
      onCapture={(base64) => setImagePreviews(prev => [...prev, base64])} 
    />
    </>
  );
}
