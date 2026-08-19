"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function InteractiveAurora() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <div className="absolute inset-[-50%] opacity-80 blur-[80px]">
        {/* Base Aurora Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,var(--color-primary)_0%,transparent_45%),radial-gradient(circle_at_85%_30%,var(--color-chart-4)_0%,transparent_50%),radial-gradient(circle_at_50%_80%,var(--color-warning)_0%,transparent_50%),radial-gradient(circle_at_50%_10%,var(--color-primary)_0%,transparent_45%)] opacity-30 mix-blend-screen" />
        
        {/* Interactive blob that follows mouse */}
        <motion.div
          animate={{
            x: mousePosition.x - (typeof window !== "undefined" ? window.innerWidth / 2 : 0),
            y: mousePosition.y - (typeof window !== "undefined" ? window.innerHeight / 2 : 0),
          }}
          transition={{ type: "spring", bounce: 0, duration: 2 }}
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 mix-blend-screen"
        />
      </div>
    </div>
  );
}
