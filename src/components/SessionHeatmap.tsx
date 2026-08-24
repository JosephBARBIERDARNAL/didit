import { useEffect, useMemo, useState } from "react";
import { addDays, format, isAfter, startOfWeek } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

const WEEKS = 12;
const DAY_KEY = "yyyy-MM-dd";
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

export function SessionHeatmap() {
  const [runs, setRuns] = useState<Map<string, number>>(new Map());

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
    const fetches = Array.from(years, (year) =>
      api.listRange("year", new Date(year, 6, 1).getTime()),
    );

    Promise.all(fetches)
      .then((buckets) => {
        const map = new Map<string, number>();
        for (const bucket of buckets) {
          for (const session of bucket.sessions) {
            const key = format(new Date(session.started_at_ms), DAY_KEY);
            map.set(key, (map.get(key) ?? 0) + 1);
          }
        }
        setRuns(map);
      })
      .catch(console.error);
  }, [gridStart, today]);

  return (
    <div>
      <div className="mb-1 grid grid-cols-[32px_repeat(7,minmax(0,1fr))] gap-[3px] text-center text-[18px] text-muted-foreground">
        <span aria-hidden="true" />
        {DAY_LABELS.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      <div className="space-y-[3px]">
        {Array.from({ length: WEEKS }, (_, weekIndex) =>
          addDays(gridStart, weekIndex * 7),
        ).reverse().map((weekStart, weekIndex) => {
          const monthLabel =
            weekIndex === 0 || weekStart.getDate() <= 7
              ? format(weekStart, "MMM", { locale: fr })
              : "";

          return (
            <div
              key={weekStart.getTime()}
              className="grid grid-cols-[42px_repeat(7,minmax(0,1fr))] gap-[3px]"
            >
              <span className="flex items-center text-[18px] text-muted-foreground">
                {monthLabel}
              </span>

              {Array.from({ length: 7 }, (_, dayIndex) => {
                const day = addDays(weekStart, dayIndex);
                const dayKey = format(day, DAY_KEY);
                const runCount = runs.get(dayKey) ?? 0;
                const future = isAfter(day, today);
                const isToday = dayKey === format(today, DAY_KEY);
                const description =
                  runCount === 0
                    ? "Aucune course"
                    : `${runCount} course${runCount === 1 ? "" : "s"}`;

                return (
                  <div
                    key={dayKey}
                    title={`${format(day, "d MMM", { locale: fr })} — ${description}`}
                    aria-label={`${format(day, "d MMM", { locale: fr })} — ${description}`}
                    className={cn(
                      "aspect-square overflow-hidden rounded-[3px] border",
                      future
                        ? "border-transparent bg-transparent"
                        : isToday
                          ? runCount > 0
                            ? "border-black bg-brand"
                            : "border-black bg-input"
                          : runCount > 0
                            ? "border-transparent bg-brand"
                            : "border-black/[0.06] bg-input",
                    )}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-end gap-3 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-[3px] border border-black/[0.2] bg-brand" />
          Course
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-[3px] border border-black/[0.2] bg-input" />
          Aucune
        </span>
      </div>
    </div>
  );
}
