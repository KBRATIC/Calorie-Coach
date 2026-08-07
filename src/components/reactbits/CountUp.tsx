import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
};

/** Número que anima até o valor final (estilo reactbits Count Up). */
export function CountUp({ value, duration = 700, decimals = 0, className }: Props) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}
