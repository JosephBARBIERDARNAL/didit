import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { save } from "@tauri-apps/plugin-dialog";
import {
  Activity,
  Bike,
  Download,
  Dumbbell,
  Footprints,
  Scale,
} from "lucide-react";
import { api, type TrainingSummary } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function AppSelector() {
  const nav = useNavigate();
  const [summary, setSummary] = useState<TrainingSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  useEffect(() => {
    api
      .trainingSummary()
      .then((value) => {
        setSummary(value);
        setSummaryError(false);
      })
      .catch((error) => {
        console.error(error);
        setSummaryError(true);
      });
  }, []);

  async function onExport() {
    if (exporting) return;
    setExporting(true);
    setExportStatus(null);
    try {
      const path = await save({
        defaultPath: "didit-export.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (!path) return;
      await api.exportData(path);
      setExportStatus("Export saved");
    } catch (error) {
      console.error(error);
      setExportStatus("Export failed");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <header className="mb-10 mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-tight">didit</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your training dashboard
          </p>
        </div>
        <Button
          onClick={onExport}
          disabled={exporting}
          size="sm"
          variant="ghost"
          className="-mr-2 mt-1 px-2 text-xs"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting…" : "Export data"}
        </Button>
      </header>

      {exportStatus && (
        <p
          className="-mt-7 mb-5 text-right text-xs text-muted-foreground"
          aria-live="polite"
        >
          {exportStatus}
        </p>
      )}

      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => nav("/sport")}
            size="xl"
            variant="primary"
            className="w-full font-display text-xl"
          >
            <Activity className="h-6 w-6" /> Sport
          </Button>
          <Button
            onClick={() => nav("/weight")}
            size="xl"
            variant="secondary"
            className="w-full font-display text-xl"
          >
            <Scale className="h-6 w-6" /> Weight
          </Button>
        </div>

        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display text-lg">Last 30 days</h2>
            <span className="text-xs text-muted-foreground">Training time</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat
              icon={Footprints}
              label="Running"
              value={
                summary ? formatDuration(summary.running_duration_ms) : "—"
              }
            />
            <Stat
              icon={Bike}
              label="Biking"
              value={summary ? formatDuration(summary.biking_duration_ms) : "—"}
            />
            <Stat
              icon={Dumbbell}
              label="Gym"
              value={
                summary
                  ? `${summary.gym_session_count} session${summary.gym_session_count === 1 ? "" : "s"}`
                  : "—"
              }
            />
          </div>
          {summaryError && (
            <p className="mt-3 text-xs text-destructive">
              Summary unavailable. Export data to help diagnose this device.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Footprints;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-2 font-display text-sm tabular-nums">{value}</div>
    </Card>
  );
}
