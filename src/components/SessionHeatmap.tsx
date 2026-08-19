import { useEffect, useMemo, useState } from "react";
import { addDays, format, isAfter, startOfWeek } from "date-fns";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

const WEEKS = 16;
const DAY_KEY = "yyyy-MM-dd";

type Sport = "running" | "biking" | "gym";
type DayActivities = Partial<Record<Sport, number>>;

const SPORT_ORDER: Sport[] = ["running", "biking", "gym"];
const SPORT_LABELS: Record<Sport, string> = {
  running: "Running",
  biking: "Biking",
  gym: "Gym",
};
const SPORT_COLORS: Record<Sport, string> = {
  running: "hsl(var(--accent))",
  biking: "hsl(var(--brand))",
  gym: "hsl(var(--sport-gym))",
};

function describeActivities(activities: DayActivities | undefined): string {
  const descriptions = SPORT_ORDER.flatMap((sport) => {
    const count = activities?.[sport] ?? 0;
    if (count === 0) return [];
    return [
      count === 1 ? SPORT_LABELS[sport] : `${SPORT_LABELS[sport]} (${count})`,
    ];
  });
  return descriptions.length > 0 ? descriptions.join(", ") : "No training";
}

export function SessionHeatmap() {
  const [activities, setActivities] = useState<Map<string, DayActivities>>(
    new Map(),
  );

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
    const fetches: Promise<{ kind: Sport; timestamps: number[] }>[] = [];
    for (const year of years) {
      const anchorMs = new Date(year, 6, 1).getTime();
      fetches.push(
        api.listRange("year", anchorMs, "running").then((bucket) => ({
          kind: "running",
          timestamps: bucket.sessions.map((session) => session.started_at_ms),
        })),
        api.listRange("year", anchorMs, "biking").then((bucket) => ({
          kind: "biking",
          timestamps: bucket.sessions.map((session) => session.started_at_ms),
        })),
        api.listGymRange("year", anchorMs).then((bucket) => ({
          kind: "gym",
          timestamps: bucket.sessions.map((session) => session.logged_at_ms),
        })),
      );
    }

    Promise.all(fetches)
      .then((results) => {
        const map = new Map<string, DayActivities>();
        for (const { kind, timestamps } of results) {
          for (const ms of timestamps) {
            const key = format(new Date(ms), DAY_KEY);
            const day = map.get(key) ?? {};
            day[kind] = (day[kind] ?? 0) + 1;
            map.set(key, day);
          }
        }
        setActivities(map);
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
          const dayActivities = activities.get(dayKey);
          const isToday = dayKey === format(today, DAY_KEY);
          const sports = SPORT_ORDER.filter(
            (sport) => (dayActivities?.[sport] ?? 0) > 0,
          );
          const hasActivities = sports.length > 0;
          const description = describeActivities(dayActivities);
          return (
            <div
              key={i}
              title={`${format(day, "MMM d")} — ${description}`}
              aria-label={`${format(day, "MMM d")} — ${description}`}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[3px] border",
                isToday
                  ? "border-black"
                  : hasActivities
                    ? "border-transparent"
                    : "border-black/[0.06] bg-input",
              )}
            >
              {hasActivities && (
                <div
                  className="absolute inset-0 grid"
                  style={{
                    gridTemplateRows: `repeat(${sports.length}, minmax(0, 1fr))`,
                  }}
                  aria-hidden="true"
                >
                  {sports.map((sport) => (
                    <span
                      key={sport}
                      style={{ backgroundColor: SPORT_COLORS[sport] }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        {SPORT_ORDER.map((sport) => (
          <span key={sport} className="flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-[3px] border border-black/[0.2]"
              style={{ background: SPORT_COLORS[sport] }}
            />
            {SPORT_LABELS[sport]}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-[3px] border border-black/[0.2] bg-input" />
          None
        </span>
      </div>
    </div>
  );
}
