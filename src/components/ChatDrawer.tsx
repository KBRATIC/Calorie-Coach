import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface Message {
  role: "user" | "model";
  text: string;
  imageBase64?: string;
}

export function ChatDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Sou o assistente de nutrição do KcalTrack. Como posso te ajudar hoje? Tire dúvidas sobre alimentos, peça sugestões de refeições saudáveis ou envie uma foto do seu prato para estimar as calorias.",
    },
  ]);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64Preview, setImageBase64Preview] = useState<string | null>(null);
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
        setInput((prev) => {
          const sep = prev && !prev.endsWith(" ") && !finalTranscript.startsWith(" ") ? " " : "";
          return prev + sep + finalTranscript;
        });
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
  }, [messages, isLoading, imageBase64Preview]);

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
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      try {
        const compressedBase64 = await compressImage(file);
        setImageBase64Preview(compressedBase64);
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
      }
    }
    // reset input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageBase64Preview(null);
  };

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!input.trim() && !imageBase64Preview) || isLoading) return;

    const userMessage = input.trim();
    const imageToSend = imageBase64Preview;
    
    setInput("");
    setImageFile(null);
    setImageBase64Preview(null);

    const newMessages: Message[] = [
      ...messages,
      { role: "user", text: userMessage, imageBase64: imageToSend || undefined },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Gemini API requires the first message to be from the 'user'.
      // If the first message in our state is the default 'model' greeting, we must exclude it.
      const apiMessages = newMessages.filter((m, idx) => !(idx === 0 && m.role === "model"));
      const response = await ask({ data: { messages: apiMessages, date: activeDayState.date } });
      setMessages((prev) => [...prev, { role: "model", text: response.text }]);
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Desculpe, ocorreu um erro ao conectar à IA. Tente novamente." },
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
      if ((input.trim() || imageBase64Preview) && !isLoading) {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        handleSend(fakeEvent);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        onInteractOutside={(e) => {
          if (isCameraOpen) e.preventDefault();
        }}
        className="sm:max-w-2xl w-full h-[100dvh] sm:h-[80vh] bg-surface/30 backdrop-blur-3xl p-0 gap-0 overflow-hidden border-x-0 sm:border border-white/5 sm:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.6)] sm:rounded-[32px] mx-auto flex flex-col"
      >
        <div className="absolute inset-0 bg-background/40 pointer-events-none -z-10" />
        
        <DialogHeader className="p-5 sm:p-6 border-b border-white/5 shrink-0 bg-white/[0.02]">
          <DialogTitle className="flex items-center gap-3 text-xl font-medium tracking-tight">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary shadow-[var(--shadow-glow)]">
              <Sparkles className="size-5" />
            </div>
            KcalTrack Assistant
          </DialogTitle>
          <DialogDescription className="hidden">Assistente de Nutrição</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-4 pt-4">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
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
                      className={`max-w-[85%] rounded-[24px] px-5 py-4 text-[15px] leading-relaxed flex flex-col gap-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20"
                          : "bg-white/5 text-foreground rounded-bl-sm border border-white/5"
                      }`}
                    >
                      {msg.imageBase64 && (
                        <img 
                          src={msg.imageBase64} 
                          alt="Enviada pelo usuário" 
                          className="w-full max-w-[240px] rounded-2xl object-cover shadow-sm border border-white/10" 
                        />
                      )}
                      
                      {msg.role === "model" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-primary">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text && <span>{msg.text}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-[24px] rounded-bl-sm bg-white/5 px-6 py-5 text-foreground border border-white/5">
                      <div className="flex gap-1.5 items-center">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} className="size-2 rounded-full bg-primary" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.2 }} className="size-2 rounded-full bg-primary" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut", delay: 0.4 }} className="size-2 rounded-full bg-primary" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        <div className="p-3 sm:p-5 flex flex-col gap-3 bg-black/20 border-t border-white/5 shrink-0">
          <AnimatePresence>
            {imageBase64Preview && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="relative self-start ml-2 mt-2"
              >
                <div className="relative rounded-[20px] overflow-hidden border border-white/10 shadow-lg">
                  <img src={imageBase64Preview} alt="Preview" className="h-24 w-24 object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/40 text-white hover:bg-black/60 active:scale-[0.95] transition-transform"
                    onClick={removeImage}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="mb-2 mx-2 px-5 py-4 bg-white/5 rounded-3xl border border-primary/20 flex flex-col gap-2 relative overflow-hidden backdrop-blur-md"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent bg-[length:200%_100%] animate-[gradient_2s_linear_infinite]" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex gap-1 h-4 items-center justify-center">
                    <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-primary rounded-full" />
                    <motion.div animate={{ height: [4, 24, 4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-primary rounded-full" />
                    <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-primary rounded-full" />
                    <motion.div animate={{ height: [4, 20, 4] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1 bg-primary rounded-full" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Ouvindo...</span>
                </div>
                {interimText && (
                  <p className="text-base text-foreground/90 font-light relative z-10">
                    "{interimText}"
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSend} className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-[32px] p-1 shadow-inner focus-within:border-primary/50 transition-colors">
            <input 
              id="chat-image-upload"
              name="chat-image-upload"
              aria-label="Upload de imagem"
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-transparent hover:bg-white/10 shrink-0 text-muted-foreground hover:text-foreground transition-colors active:scale-[0.95]"
                  disabled={isLoading}
                  aria-label="Anexar arquivo"
                >
                  <Paperclip className="size-[22px]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                side="top" 
                align="start" 
                className="w-56 p-2 rounded-3xl bg-surface/80 backdrop-blur-xl border-white/10 shadow-2xl mb-4"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-2xl hover:bg-white/10 h-12"
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
                    className="w-full justify-start gap-3 rounded-2xl hover:bg-white/10 h-12"
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
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = '50px';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Como posso te ajudar?"
                className="pr-24 min-h-[50px] rounded-none py-3.5 resize-none bg-transparent hover:bg-transparent focus:bg-transparent transition-colors border-transparent focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50 text-base sm:text-lg font-light scrollbar-hide"
                disabled={isLoading}
                rows={1}
                style={{ overflowY: 'auto' }}
              />
              <div className="absolute right-2 top-1.5 flex items-center gap-1.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={`h-10 w-10 rounded-full transition-transform active:scale-[0.95] ${isListening ? "text-destructive animate-pulse bg-destructive/10" : "text-muted-foreground hover:bg-white/10 hover:text-foreground"}`}
                  onClick={toggleListening}
                  disabled={isLoading}
                  aria-label="Ativar microfone"
                >
                  <Mic className="size-5" />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  className="h-10 w-10 rounded-full transition-transform active:scale-[0.95] bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  disabled={(!input.trim() && !imageBase64Preview) || isLoading}
                  aria-label="Enviar mensagem"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
    <CameraCaptureDialog 
      open={isCameraOpen} 
      onClose={() => setIsCameraOpen(false)} 
      onCapture={(base64) => setImageBase64Preview(base64)} 
    />
    </>
  );
}
