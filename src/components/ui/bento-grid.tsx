import { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 lg:grid-cols-3 gap-4",
        "[grid-auto-rows:minmax(22rem,auto)]",
        className,
      )}
    >
      {children}
    </div>
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
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // dark styles (premium apple-y)
      "transform-gpu bg-surface/40 backdrop-blur-xl border border-border/50 [box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    <div className="flex-1 w-full overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500">{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300 group-hover:-translate-y-2 mt-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary origin-left transform-gpu transition-all duration-300 ease-in-out group-hover:scale-75 group-hover:bg-primary/20">
        <Icon className="h-6 w-6" weight="duotone" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mt-2">
        {name}
      </h3>
      <p className="max-w-lg text-muted-foreground">{description}</p>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button variant="ghost" asChild size="sm" className="pointer-events-auto text-primary hover:text-primary hover:bg-primary/10">
        <a href={href}>
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-neutral-800/10" />
  </div>
);

export { BentoCard, BentoGrid };
