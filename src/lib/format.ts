export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function formatDistance(m: number | null | undefined): string {
  const v = m ?? 0;
  if (v < 1000) return `${v.toFixed(0)} m`;
  return `${(v / 1000).toFixed(2)} km`;
}

export function formatPace(secPerKm: number | null | undefined): string {
  const v = secPerKm ?? 0;
  if (!Number.isFinite(v) || v <= 0) return "—";
  const m = Math.floor(v / 60);
  const s = Math.round(v % 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

export function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString("fr-FR", { month: "short", day: "numeric" });
}

export function formatDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString("fr-FR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRangeLabel(
  range: "week" | "month" | "year",
  fromMs: number,
): string {
  const d = new Date(fromMs);
  if (range === "week") {
    return `Semaine du ${d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    })}`;
  }
  if (range === "month") {
    return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  }
  return d.toLocaleDateString("fr-FR", { year: "numeric" });
}

export function formatInstallDate(ms: number): string {
  const d = new Date(ms);
  const date = d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} à ${time}`;
}
