import { Route, Routes } from "react-router-dom";
import { PrideFrog, PrideProvider, usePride } from "@/components/PrideFrog";
import { AppSelector } from "@/pages/AppSelector";
import { ActivityHome } from "@/pages/ActivityHome";
import { ActivityTrack } from "@/pages/ActivityTrack";
import { ActivitySummary } from "@/pages/ActivitySummary";
import { ActivityHistory } from "@/pages/ActivityHistory";

export default function App() {
  return (
    <PrideProvider>
      <AppShell />
    </PrideProvider>
  );
}

function AppShell() {
  const { message } = usePride();

  return (
    <div className="min-h-full flex justify-center bg-background">
      <div
        className={`relative w-full max-w-[440px] min-h-screen px-5 pb-6 flex flex-col ${message ? "pt-28" : "pt-6"}`}
      >
        <PrideFrog />
        <Routes>
          <Route path="/" element={<AppSelector />} />
          <Route path="/running" element={<ActivityHome />} />
          <Route path="/running/track" element={<ActivityTrack />} />
          <Route path="/running/summary/:id" element={<ActivitySummary />} />
          <Route path="/running/history" element={<ActivityHistory />} />
        </Routes>
      </div>
    </div>
  );
}
