import { useEffect, useMemo, useState } from "react";
import { addDays, format, isAfter, startOfWeek } from "date-fns";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

const WEEKS = 16;
const DAY_KEY = "yyyy-MM-dd";

function cellColor(count: number): string {
  if (count >= 2) return "bg-brand";
  if (count === 1) return "bg-accent";
  return "bg-input";
}

export function SessionHeatmap() {
  const [counts, setCounts] = useState<Map<string, number>>(new Map());

  const { gridStart, today } = useMemo(() => {
    const now = new Date();
    return {
      today: now,
      gridStart: addDays(
        startOfWeek(now, { weekStartsOn: 1 }),
        -7 * (WEEKS - 1),
      ),
    };
  }, []);

  useEffect(() => {
    const years = new Set([gridStart.getFullYear(), today.getFullYear()]);
    const fetches: Promise<number[]>[] = [];
    for (const year of years) {
      const anchorMs = new Date(year, 6, 1).getTime();
      fetches.push(
        api
          .listRange("year", anchorMs, "running")
          .then((b) => b.sessions.map((s) => s.started_at_ms)),
        api
          .listRange("year", anchorMs, "biking")
          .then((b) => b.sessions.map((s) => s.started_at_ms)),
        api
          .listGymRange("year", anchorMs)
          .then((b) => b.sessions.map((s) => s.logged_at_ms)),
      );
    }
    Promise.all(fetches)
      .then((results) => {
        const map = new Map<string, number>();
        for (const timestamps of results) {
          for (const ms of timestamps) {
            const key = format(new Date(ms), DAY_KEY);
            map.set(key, (map.get(key) ?? 0) + 1);
          }
        }
        setCounts(map);
      })
      .catch(console.error);
  }, [gridStart, today]);

  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string }[] = [];
    for (let w = 0; w < WEEKS; w++) {
      const weekStart = addDays(gridStart, w * 7);
      // Label the week containing the 1st of a month; skip the very first
      // column so a clipped label never shows.
      if (w > 0 && weekStart.getDate() <= 7) {
        labels.push({ week: w, label: format(weekStart, "MMM") });
      }
    }
    return labels;
  }, [gridStart]);

  return (
    <div>
      <div className="relative mb-1 h-3.5">
        {monthLabels.map(({ week, label }) => (
          <span
            key={week}
            className="absolute top-0 text-[14px] leading-none text-muted-foreground"
            style={{ left: `${(week / WEEKS) * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="grid grid-flow-col auto-cols-fr grid-rows-7 gap-[3px]">
        {Array.from({ length: WEEKS * 7 }, (_, i) => {
          const day = addDays(gridStart, i);
          if (isAfter(day, today)) {
            return <div key={i} className="aspect-square" />;
          }
          const dayKey = format(day, DAY_KEY);
          const count = counts.get(dayKey) ?? 0;
          const isToday = dayKey === format(today, DAY_KEY);
          return (
            <div
              key={i}
              title={`${format(day, "MMM d")} — ${count} session${count === 1 ? "" : "s"}`}
              className={cn(
                "aspect-square rounded-[3px] border",
                isToday ? "border-black" : "border-black/[0.06]",
                cellColor(count),
              )}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-end gap-3 text-[10px] text-muted-foreground">
        {(
          [
            ["bg-input", "0"],
            ["bg-accent", "1"],
            ["bg-brand", "2"],
          ] as const
        ).map(([bg, label]) => (
          <span key={label} className="flex items-center gap-1">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-[3px] border border-black/[0.2]",
                bg,
              )}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
