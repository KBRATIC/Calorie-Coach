"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";

export function InteractiveAurora() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // useSpring smooths out the raw mouse movement, creating a fluid tail effect
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  useEffect(() => {
    // Initial center position
    mouseX.set(window.innerWidth / 2);
    mouseY.set(window.innerHeight / 2);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      <div className="absolute inset-[-50%] opacity-80 blur-[80px]">
        {/* Base Aurora Mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_50%,var(--color-primary)_0%,transparent_45%),radial-gradient(circle_at_85%_30%,var(--color-chart-4)_0%,transparent_50%),radial-gradient(circle_at_50%_80%,var(--color-warning)_0%,transparent_50%),radial-gradient(circle_at_50%_10%,var(--color-primary)_0%,transparent_45%)] opacity-30 mix-blend-screen" />
        
        {/* Interactive blob that follows mouse, driven entirely outside React's render cycle */}
        <motion.div
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%"
          }}
          className="absolute left-0 top-0 h-[600px] w-[600px] rounded-full bg-primary/20 mix-blend-screen"
        />
      </div>
    </div>
  );
}
