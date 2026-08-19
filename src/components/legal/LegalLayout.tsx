import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ShieldCheck, Cookie } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

const links = [
  { href: "/termos", label: "Termos de Uso", icon: BookOpen },
  { href: "/privacidade", label: "Política de Privacidade", icon: ShieldCheck },
  { href: "/cookies", label: "Política de Cookies", icon: Cookie },
];

export function LegalLayout({ children, title, lastUpdated }: { children: ReactNode, title: string, lastUpdated: string }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-32 md:px-10 lg:pt-20">
        
        <Link to="/" className="inline-block mb-12">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" weight="bold" />
            Voltar para a Home
          </Button>
        </Link>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Documentos Legais</h3>
              <nav className="flex flex-col gap-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <link.icon className="size-4" weight={isActive ? "fill" : "regular"} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">{title}</h1>
              <p className="text-muted-foreground">Última atualização: {lastUpdated}</p>
            </div>
            
            <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
