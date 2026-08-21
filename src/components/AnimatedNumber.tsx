import { useEffect, useRef } from "react";
import { animate } from "motion/react";

export function AnimatedNumber({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    
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
  }, [value]);

  return <span ref={nodeRef}>{Math.round(prevValue.current)}</span>;
}
