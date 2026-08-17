import type { WeightEntry } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Props {
  entries: WeightEntry[];
  height?: number;
}

export function WeightChart({ entries, height = 190 }: Props) {
  const points = [...entries].sort(
    (a, b) => a.logged_at_ms - b.logged_at_ms || a.id - b.id,
  );

  if (points.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No weight entries in the last 90 days.
      </div>
    );
  }

  const w = 360;
  const paddingX = 10;
  const paddingY = 18;
  const minWeight = Math.min(...points.map((point) => point.weight_kg));
  const maxWeight = Math.max(...points.map((point) => point.weight_kg));
  const weightRange = Math.max(maxWeight - minWeight, 1);
  const chartWidth = w - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? w / 2
        : paddingX + (index / (points.length - 1)) * chartWidth;
    const y =
      paddingY + ((maxWeight - point.weight_kg) / weightRange) * chartHeight;
    return { x, y, point };
  });
  const polyline = coords
    .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label="Weight over the last 90 days"
      >
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={w - paddingX}
          y2={height - paddingY}
          stroke="hsl(var(--border))"
        />
        {coords.length > 1 && (
          <polyline
            points={polyline}
            fill="none"
            stroke="hsl(var(--brand))"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {coords.map(({ x, y, point }) => (
          <circle
            key={point.id}
            cx={x}
            cy={y}
            r={4}
            fill="hsl(var(--accent))"
            stroke="hsl(var(--brand))"
            strokeWidth={2}
          >
            <title>
              {formatDate(point.logged_at_ms)} — {point.weight_kg.toFixed(1)} kg
            </title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{formatDate(points[0].logged_at_ms)}</span>
        <span>{formatDate(points[points.length - 1].logged_at_ms)}</span>
      </div>
    </div>
  );
}
