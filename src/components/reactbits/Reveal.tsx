import type { ReactNode } from "react";
import { motion } from "motion/react";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/** Entrada suave ao montar (estilo reactbits Animated Content). */
export function Reveal({ children, delay = 0, y = 18, className }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
