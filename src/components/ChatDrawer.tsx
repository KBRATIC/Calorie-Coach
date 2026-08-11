import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

export function ChatDrawer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Olá! Sou o assistente de nutrição do KcalTrack. Como posso te ajudar hoje? Tire dúvidas sobre alimentos, peça sugestões de refeições saudáveis, ou estimativas de calorias.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askAssistant);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await ask({ data: { messages: newMessages } });
      setMessages((prev) => [...prev, { role: "model", text: response.text }]);
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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] bg-background/95 backdrop-blur-xl border-t border-border/50">
        <DrawerHeader className="pb-4">
          <DrawerTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Sparkles className="size-4" />
            </div>
            Assistente Nutricional
          </DrawerTitle>
          <DrawerDescription>Tire suas dúvidas sobre nutrição e calorias.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-4">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollRef}>
            <div className="flex flex-col gap-4 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-secondary text-secondary-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "model" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="flex justify-start"
                  >
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-secondary-foreground">
                      <Loader2 className="size-4 animate-spin" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 pt-2">
          <form onSubmit={handleSend} className="relative flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte algo..."
              className="pr-12 rounded-full h-12 bg-secondary/50 border-border/50"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-1.5 h-9 w-9 rounded-full transition-transform active:scale-95"
              disabled={!input.trim() || isLoading}
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
