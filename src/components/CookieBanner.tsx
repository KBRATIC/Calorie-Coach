import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookie_consent");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  function acceptCookies() {
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="max-w-4xl mx-auto panel border-primary/20 bg-background/95 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between">
        <div className="text-sm text-muted-foreground flex-1">
          <p className="mb-2">
            Nós utilizamos cookies essenciais para manter sua sessão ativa e salvar suas preferências de interface.
          </p>
          <p>
            Ao continuar utilizando o KcalTrack, você concorda com a nossa{" "}
            <Link to="/privacidade" className="text-primary hover:underline font-medium">Política de Privacidade</Link> e nossos{" "}
            <Link to="/termos" className="text-primary hover:underline font-medium">Termos de Uso</Link>.
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <Button onClick={acceptCookies} className="w-full sm:w-auto">
            Entendi e concordo
          </Button>
        </div>
      </div>
    </div>
  );
}
