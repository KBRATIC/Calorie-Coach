import { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={cn(
        "grid w-full grid-cols-1 lg:grid-cols-3 gap-4",
        "[grid-auto-rows:minmax(22rem,auto)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <motion.div
    key={name}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-20px" }}
    variants={{
      hidden: { opacity: 0, y: 30, scale: 0.98 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 150, damping: 20 } },
    }}
    whileHover={{ scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 20 } }}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // dark styles (premium apple-y)
      "transform-gpu bg-surface/40 backdrop-blur-xl border border-border/50 [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    <div className="flex-1 w-full overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 mt-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary origin-left transform-gpu transition-all duration-300 ease-in-out group-hover:scale-75 group-hover:bg-primary/20">
        <Icon className="h-6 w-6" weight="duotone" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mt-2">
        {name}
      </h3>
      <p className="max-w-lg text-muted-foreground">{description}</p>
      
      {/* Botão sempre visível e sem sobreposição */}
      <div className="mt-2 flex items-center pointer-events-auto">
        <a href={href} className="text-sm font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          {cta}
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  </motion.div>
);

export { BentoCard, BentoGrid };
