import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, ShieldCheck, Cookie } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { motion } from "motion/react";

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotateX: 5 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { type: "spring", stiffness: 250, damping: 15 } }
};

const links = [
  { href: "/termos", label: "Termos de Uso", icon: BookOpen },
  { href: "/privacidade", label: "Política de Privacidade", icon: ShieldCheck },
  { href: "/cookies", label: "Política de Cookies", icon: Cookie },
];

export function LegalLayout({ children, title, lastUpdated }: { children: ReactNode, title: string, lastUpdated: string }) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden text-foreground selection:bg-primary/30">
      <div className="aurora-layer" aria-hidden />
      <div className="mx-auto max-w-[90rem] px-4 pt-12 pb-32 md:px-10 lg:pt-20 relative z-10">
        
        <Link to="/" className="inline-block mb-12 relative z-10 group">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" weight="bold" />
            Voltar para a Home
          </Button>
        </Link>

        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.15 } } }} 
          className="flex flex-col lg:flex-row gap-12 lg:gap-24"
        >
          
          {/* Sidebar Navigation */}
          <motion.aside variants={itemVariants} className="w-full lg:w-64 shrink-0">
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
          </motion.aside>

          {/* Main Content */}
          <motion.main variants={itemVariants} className="flex-1 min-w-0">
            <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/40 backdrop-blur-xl [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] p-6 sm:p-10 md:p-12">
              <div className="mb-10 border-b border-border/20 pb-8">
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4">{title}</h1>
                <p className="text-muted-foreground">Última atualização: {lastUpdated}</p>
              </div>
              
              <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-li:text-muted-foreground">
                {children}
              </div>
            </div>
          </motion.main>
        </motion.div>
      </div>
    </div>
  );
}
