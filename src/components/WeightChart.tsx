import type { WeightEntry } from "@/lib/api";
import { formatDate } from "@/lib/format";

interface Props {
  entries: WeightEntry[];
  height?: number;
}

function niceStep(range: number, tickCount: number) {
  const roughStep = range / Math.max(tickCount - 1, 1);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * magnitude;
}

function decimalsForStep(step: number) {
  return Math.max(0, Math.ceil(-Math.log10(step)));
}

function startOfDayMs(ms: number) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function WeightChart({ entries, height = 250 }: Props) {
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

  const w = 420;
  const margin = { top: 12, right: 16, bottom: 38, left: 54 };
  const plotLeft = margin.left;
  const plotRight = w - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  const minWeight = Math.min(...points.map((point) => point.weight_kg));
  const maxWeight = Math.max(...points.map((point) => point.weight_kg));
  const step = niceStep(Math.max(maxWeight - minWeight, 1), 5);
  let scaleMin = Math.floor((minWeight - step) / step) * step;
  let scaleMax = Math.ceil((maxWeight + step) / step) * step;

  // Keep a single measurement and very small changes from sitting on a
  // cramped two-tick scale.
  if (scaleMax - scaleMin < step * 4) {
    scaleMin = Math.floor(((minWeight + maxWeight) / 2 - step * 2) / step) * step;
    scaleMax = scaleMin + step * 4;
  }

  const scaleRange = scaleMax - scaleMin;
  const tickCount = Math.round(scaleRange / step) + 1;
  const tickDecimals = decimalsForStep(step);
  const formatScaleValue = (value: number) => value.toFixed(tickDecimals);
  const startDayMs = startOfDayMs(points[0].logged_at_ms);
  const endDayMs = startOfDayMs(points[points.length - 1].logged_at_ms);
  const dayRangeMs = endDayMs - startDayMs;
  const xForTimestamp = (timestampMs: number) =>
    dayRangeMs === 0
      ? plotLeft + plotWidth / 2
      : plotLeft +
        ((startOfDayMs(timestampMs) - startDayMs) / dayRangeMs) * plotWidth;
  const yForWeight = (weight: number) =>
    plotBottom - ((weight - scaleMin) / scaleRange) * plotHeight;
  const coords = points.map((point) => ({
    x: xForTimestamp(point.logged_at_ms),
    y: yForWeight(point.weight_kg),
    point,
  }));
  const polyline = coords
    .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const ticks = Array.from({ length: tickCount }, (_, index) => {
    const value = scaleMin + index * step;
    return { value, y: yForWeight(value) };
  });
  const xLabelIndexes =
    points.length <= 5
      ? points.map((_, index) => index)
      : Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]));
  const valueLabelStep = Math.max(1, Math.ceil(points.length / 12));
  const valueLabelIndexes = new Set([
    0,
    points.length - 1,
    ...points
      .map((_, index) => index)
      .filter((index) => index % valueLabelStep === 0),
  ]);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2" aria-label="Chart legend">
          <span
            className="h-2.5 w-2.5 rounded-full bg-brand"
            aria-hidden="true"
          />
          <span className="font-medium">Weight (kg)</span>
        </div>
        <span className="text-muted-foreground">
          {points.length} {points.length === 1 ? "measurement" : "measurements"}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${height}`}
        width="100%"
        height={height}
        role="img"
        aria-label="Weight over the last 90 days"
      >
        <title>Weight over the last 90 days</title>
        <desc>
          Weight measurements from {formatDate(points[0].logged_at_ms)} to {formatDate(points[points.length - 1].logged_at_ms)}.
        </desc>

        {ticks.map(({ value, y }) => (
          <g key={value}>
            <line
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke="hsl(var(--border))"
              strokeDasharray="2 4"
            />
            <text
              x={plotLeft - 9}
              y={y}
              fill="hsl(var(--muted-foreground))"
              fontSize="11"
              textAnchor="end"
              dominantBaseline="middle"
              className="tabular-nums"
            >
              {formatScaleValue(value)}
            </text>
          </g>
        ))}

        <line
          x1={plotLeft}
          y1={plotBottom}
          x2={plotRight}
          y2={plotBottom}
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

        {coords.map(({ x, y, point }, index) => (
          <g key={point.id}>
            <circle
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
            {valueLabelIndexes.has(index) && (
              <text
                x={x}
                y={y <= plotTop + 18 ? y + 17 : y - 9}
                fill="hsl(var(--foreground))"
                fontSize="10"
                fontWeight="600"
                textAnchor={
                  x <= plotLeft + 20 ? "start" : x >= plotRight - 20 ? "end" : "middle"
                }
                paintOrder="stroke"
                stroke="hsl(var(--card))"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="tabular-nums"
              >
                {point.weight_kg.toFixed(1)}
              </text>
            )}
          </g>
        ))}

        {xLabelIndexes.map((index) => {
          const { x, point } = coords[index];
          return (
            <g key={`date-${point.id}`}>
              <line
                x1={x}
                y1={plotBottom}
                x2={x}
                y2={plotBottom + 4}
                stroke="hsl(var(--border))"
              />
              <text
                x={x}
                y={plotBottom + 19}
                fill="hsl(var(--muted-foreground))"
                fontSize="11"
                textAnchor={
                  index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"
                }
              >
                {formatDate(point.logged_at_ms)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
