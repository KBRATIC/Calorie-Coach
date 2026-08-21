import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { useIsActive } from "@/hooks/useIsActive";

export function AnimatedNumber({ value }: { value: number }) {
  const isActive = useIsActive();
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    
    if (!isActive) {
      prevValue.current = 0;
      node.textContent = "0";
      return;
    }

    const controls = animate(prevValue.current, value, {
      type: "spring",
      stiffness: 60,
      damping: 15,
      onUpdate(v) {
        node.textContent = Math.round(v).toString();
      }
    });
    
    prevValue.current = value;
    
    return () => controls.stop();
  }, [value, isActive]);

  return <span ref={nodeRef}>{Math.round(prevValue.current)}</span>;
}
