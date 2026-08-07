type Props = {
  consumed: number;
  goal: number;
  size?: number;
};

export function CalorieRing({ consumed, goal, size = 200 }: Props) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1.25) : 0;
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * Math.min(pct, 1);
  const over = consumed > goal;
  const remaining = goal - consumed;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={14}
          className="stroke-secondary"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={over ? "stroke-destructive" : "stroke-primary"}
          style={{ transition: "stroke-dasharray 500ms ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="stat-number text-4xl">{Math.round(consumed)}</span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          de {Math.round(goal)} kcal
        </span>
        <span
          className={`mt-1 text-sm font-semibold ${over ? "text-destructive" : "text-primary"}`}
        >
          {over
            ? `${Math.round(Math.abs(remaining))} kcal acima`
            : `${Math.round(remaining)} kcal restantes`}
        </span>
      </div>
    </div>
  );
}
