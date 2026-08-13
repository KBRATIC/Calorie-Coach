import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, Camera, X } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";

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
      const response = await ask({ data: { messages: apiMessages } });
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] h-[75vh] md:h-[70vh] liquid-glass p-0 gap-0 overflow-hidden border border-primary/20 shadow-xl shadow-black/40 rounded-2xl mx-auto flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 to-background/90 pointer-events-none -z-10" />
        
        <DialogHeader className="p-4 border-b border-border/10 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary shadow-[var(--shadow-glow)]">
              <Sparkles className="size-4" />
            </div>
            Assistente Nutricional
          </DialogTitle>
          <DialogDescription className="hidden">Assistente de Nutrição</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-4 pt-4">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
            <div className="flex flex-col gap-5 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm flex flex-col gap-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm shadow-[var(--shadow-glow)] shadow-primary/20"
                          : "bg-secondary/40 backdrop-blur-md text-secondary-foreground rounded-bl-sm border border-border/30"
                      }`}
                    >
                      {msg.imageBase64 && (
                        <img 
                          src={msg.imageBase64} 
                          alt="Enviada pelo usuário" 
                          className="w-full max-w-[200px] rounded-xl object-cover shadow-sm border border-black/10" 
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
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-3xl rounded-bl-sm bg-secondary/40 backdrop-blur-md px-5 py-4 text-secondary-foreground border border-border/30">
                      <Loader2 className="size-5 animate-spin text-primary" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 pt-2 flex flex-col gap-2 bg-background/20 backdrop-blur-xl border-t border-border/10 shrink-0">
          <AnimatePresence>
            {imageBase64Preview && (
              <motion.div 
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, scale: 0.9, height: 0 }}
                className="relative self-start"
              >
                <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-md">
                  <img src={imageBase64Preview} alt="Preview" className="h-20 w-20 object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white"
                    onClick={removeImage}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-border/20 bg-secondary/30 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Camera className="size-5" />
            </Button>
            
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte ou envie uma foto..."
                className="pr-12 rounded-full h-12 bg-secondary/30 border-border/20 shadow-inner placeholder:text-muted-foreground/70"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full transition-transform active:scale-95 shadow-[var(--shadow-glow)]"
                disabled={(!input.trim() && !imageBase64Preview) || isLoading}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
