import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, Trash2 } from "lucide-react";
import { api, type WeightEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WeightChart } from "@/components/WeightChart";
import { formatDateTime } from "@/lib/format";

function todayStr() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function ninetyDaysAgoMs() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 89);
  return d.getTime();
}

export function WeightHome() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [date, setDate] = useState(todayStr);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listWeightEntries(ninetyDaysAgoMs()).then(setEntries).catch(console.error);
  }, []);

  async function onSave() {
    const weightKg = Number(weight);
    if (
      saving ||
      !date ||
      !Number.isFinite(weightKg) ||
      weightKg <= 0
    ) {
      return;
    }

    setSaving(true);
    try {
      // Keep the current time when logging for today; use midday for past days
      // so the entry stays on the picked date across timezone shifts.
      const loggedAtMs =
        date === todayStr()
          ? Date.now()
          : new Date(`${date}T12:00:00`).getTime();
      await api.createWeightEntry(weightKg, loggedAtMs);
      const next = await api.listWeightEntries(ninetyDaysAgoMs());
      setEntries(next);
      setWeight("");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: number) {
    if (!confirm("Delete this weight entry?")) return;
    try {
      await api.deleteWeightEntry(id);
      setEntries((current) => current.filter((entry) => entry.id !== id));
    } catch (e) {
      console.error(e);
    }
  }

  const canSave = Number.isFinite(Number(weight)) && Number(weight) > 0;

  return (
    <div className="flex-1">
      <header className="flex items-center justify-between mb-5">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
        </Link>
        <h1 className="font-display text-lg">Weight</h1>
        <Scale className="h-5 w-5 text-muted-foreground" />
      </header>

      <Card className="mb-6 p-4">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
          <span className="text-sm text-muted-foreground">Date</span>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(event) => setDate(event.target.value)}
            className="bg-transparent text-right font-medium text-foreground outline-none"
          />
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm text-muted-foreground">
            Weight (kg)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="72.5"
            className="h-14 w-full rounded-xl border border-border bg-background px-4 text-2xl font-display outline-none focus:border-brand"
          />
        </label>

        <Button
          onClick={onSave}
          disabled={saving || !canSave}
          size="lg"
          className="w-full font-display"
        >
          Save weight
        </Button>
      </Card>

      <h2 className="font-display text-lg mb-2">Progress</h2>
      <Card className="mb-6 p-4">
        <WeightChart entries={entries} />
      </Card>

      <h2 className="font-display text-lg mb-3">Recent entries</h2>
      {entries.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No weight entries yet. Add your first measurement above.
        </Card>
      ) : (
        <ul className="space-y-2">
          {entries.slice(0, 10).map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <div>
                <div className="font-medium tabular-nums">
                  {entry.weight_kg.toFixed(1)} kg
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(entry.logged_at_ms)}
                </div>
              </div>
              <button
                onClick={() => onDelete(entry.id)}
                className="p-2 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${entry.weight_kg.toFixed(1)} kilogram entry`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
