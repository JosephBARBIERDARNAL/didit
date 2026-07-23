import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DEFAULT_EXERCISES } from "@/lib/gymExercises";
import { cn } from "@/lib/cn";

function todayStr() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function GymLog() {
  const nav = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [date, setDate] = useState(todayStr);
  const [saving, setSaving] = useState(false);

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function onSave() {
    if (saving || selected.size === 0) return;
    setSaving(true);
    try {
      // Keep the current time when logging for today; use midday for past days
      // so the entry stays on the picked date across timezone shifts.
      const loggedAtMs =
        !date || date === todayStr()
          ? Date.now()
          : new Date(`${date}T12:00:00`).getTime();
      await api.createGymSession(Array.from(selected), loggedAtMs);
      nav("/gym", { replace: true });
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center justify-between mb-5">
        <Link
          to="/gym"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Cancel
        </Link>
        <h1 className="font-display text-lg">Log Workout</h1>
        <span className="w-16" />
      </header>

      <label className="mb-5 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="text-sm text-muted-foreground">Date</span>
        <input
          type="date"
          value={date}
          max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="bg-transparent text-right font-medium text-foreground outline-none"
        />
      </label>

      <ul className="space-y-2 mb-6">
        {DEFAULT_EXERCISES.map((name) => {
          const active = selected.has(name);
          return (
            <li key={name}>
              <button
                onClick={() => toggle(name)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                  active
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border bg-card text-foreground hover:border-muted",
                )}
              >
                <span className="font-medium">{name}</span>
                {active && <Check className="h-5 w-5 text-brand" />}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <Button
          onClick={onSave}
          disabled={saving || selected.size === 0}
          size="xl"
          className="w-full font-display text-xl"
        >
          Save {selected.size > 0 ? `(${selected.size})` : ""}
        </Button>
      </div>
    </div>
  );
}
