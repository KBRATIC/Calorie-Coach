import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronRight, ArrowRight, Target, Sparkles, Utensils } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchHasSeenOnboarding, markOnboardingSeen } from "@/lib/api";
import { useSession } from "@/hooks/useSession";

export function Onboarding() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data: hasSeen, isLoading } = useQuery({
    queryKey: ["onboarding", user?.id],
    queryFn: () => fetchHasSeenOnboarding(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && hasSeen === false) {
      setOpen(true);
    }
  }, [hasSeen, isLoading]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const markSeenMutation = useMutation({
    mutationFn: () => markOnboardingSeen(user!.id),
    onSuccess: () => {
      setOpen(false);
      queryClient.setQueryData(["onboarding", user?.id], true);
    }
  });

  const nextSlide = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const finish = () => {
    markSeenMutation.mutate();
  };

  const slides = [
    {
      title: "Bem-vindo ao Calorie Coach!",
      description: "A forma mais simples, rápida e inteligente de registrar sua alimentação e atingir seus objetivos.",
      icon: <Utensils className="size-12 text-primary mb-4" />,
    },
    {
      title: "1. Defina sua Meta",
      description: "Vá na aba 'Perfil' para calcular seu gasto calórico (TMB) e saber o quanto você precisa comer por dia.",
      icon: <Target className="size-12 text-primary mb-4" />,
    },
    {
      title: "2. Lance com Inteligência Artificial",
      description: "Na aba 'Diário', use o Assistente IA para registrar refeições apenas digitando. Exemplo: 'Comi 2 pães com ovo'.",
      icon: <Sparkles className="size-12 text-primary mb-4" />,
    }
  ];

  if (!user || hasSeen) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        finish();
      }
    }}>
      <DialogContent 
        className="sm:max-w-md p-0 overflow-hidden border-border/60 bg-background/95 backdrop-blur-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Introdução ao aplicativo</DialogTitle>
        <DialogDescription className="sr-only">Slides de apresentação das funcionalidades</DialogDescription>
        
        <div className="relative" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 p-8 flex flex-col items-center text-center justify-center min-h-[320px]">
                {slide.icon}
                <h3 className="text-xl font-bold mb-3">{slide.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{slide.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-muted/30 border-t border-border/40">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-primary/30"}`} 
              />
            ))}
          </div>

          {selectedIndex < slides.length - 1 ? (
            <Button onClick={nextSlide} className="rounded-full gap-2 px-6">
              Próximo <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} disabled={markSeenMutation.isPending} className="rounded-full gap-2 px-6 bg-primary text-primary-foreground">
              Começar <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
