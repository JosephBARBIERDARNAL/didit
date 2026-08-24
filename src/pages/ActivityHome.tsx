import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Home, Play } from "lucide-react";
import { api, type SessionRow } from "@/lib/api";
import { RUNNING_CONFIG } from "@/lib/activities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatInstallDate,
  formatDate,
  formatDistance,
  formatDuration,
  formatPace,
} from "@/lib/format";

export function ActivityHome() {
  const config = RUNNING_CONFIG;
  const nav = useNavigate();
  const [recent, setRecent] = useState<SessionRow[]>([]);
  const [installationUpdatedAtMs, setInstallationUpdatedAtMs] = useState<
    number | null
  >(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api
      .installationUpdatedAtMs()
      .then(setInstallationUpdatedAtMs)
      .catch(console.error);
    api.listRecent(5).then(setRecent).catch(console.error);
    api.currentState().then((state) => {
      if (state !== "idle") nav("/running/track", { replace: true });
    });
  }, [nav]);

  async function onStart() {
    if (starting) return;
    setStarting(true);
    try {
      await api.startSession();
      nav("/running/track");
    } catch (e) {
      console.error(e);
      setStarting(false);
    }
  }

  return (
    <>
      <header className="mb-8 flex items-start justify-between mt-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">
            {config.title}
          </h1>
          {installationUpdatedAtMs && (
            <p className="mt-1 text-sm text-muted-foreground">
              Version {formatInstallDate(installationUpdatedAtMs)}
            </p>
          )}
        </div>
        <Link
          to="/"
          className="p-2 -m-2 text-muted-foreground hover:text-foreground"
          aria-label="Accueil"
        >
          <Home className="h-5 w-5" />
        </Link>
      </header>

      <Button
        onClick={onStart}
        disabled={starting}
        size="xl"
        className="w-full mb-8 font-display text-xl"
      >
        <Play className="h-5 w-5" /> {config.verb}
      </Button>

      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-lg">Courses récentes</h2>
        <Link
          to="/running/history"
          className="text-sm text-brand hover:underline inline-flex items-center gap-1"
        >
          Historique <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Aucune course pour le moment. Appuie sur « {config.verb} » pour
          enregistrer ta première.
        </Card>
      ) : (
        <ul className="space-y-2">
          {recent.map((s) => (
            <li key={s.id}>
              <Link
                to={`/running/summary/${s.id}`}
                className="block rounded-xl border border-border bg-card px-4 py-3 hover:border-muted transition-colors"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">
                    {formatDate(s.started_at_ms)}
                  </span>
                  <span className="font-display text-lg tabular-nums">
                    {formatDistance(s.total_distance_m)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
                  <span>{formatDuration(s.moving_duration_ms ?? 0)}</span>
                  <span>{formatPace(s.avg_pace_s_per_km)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
