import { SessionHeatmap } from "@/components/SessionHeatmap";
import { useNavigate } from "react-router-dom";
import { Footprints } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppSelector() {
  const nav = useNavigate();

  return (
    <>
      <header className="mb-10 mt-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-tight">didit</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => nav("/running")}
            size="xl"
            variant="primary"
            className="w-full font-display text-xl"
          >
            <Footprints className="h-6 w-6" /> Commencer une course
          </Button>
        </div>

        <section>
          <h2 className="mb-3 font-display text-lg">Rythme de course</h2>
          <SessionHeatmap />
        </section>
      </div>
    </>
  );
}
