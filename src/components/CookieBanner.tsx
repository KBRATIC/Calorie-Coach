import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check local storage after mount to prevent hydration mismatch
    const hasConsented = localStorage.getItem("cookie_consent");
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6 md:max-w-[420px] md:bottom-6 md:left-6 md:right-auto animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/80 p-6 shadow-2xl backdrop-blur-xl">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dispensar"
        >
          <X className="size-4" weight="bold" />
        </button>
        
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Cookie className="size-5" weight="duotone" />
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Privacidade e Cookies</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos cookies estritamente necessários para autenticação e funcionamento do app. Não usamos cookies de rastreamento.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <Button onClick={handleAccept} size="sm" className="rounded-full shadow-glow">
                Aceitar
              </Button>
              <Button asChild variant="ghost" size="sm" className="rounded-full text-muted-foreground hover:text-foreground">
                <Link to="/cookies" onClick={() => setIsVisible(false)}>
                  Saber mais
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
