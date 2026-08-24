import { createContext, useContext, useState, type ReactNode } from "react";
import { getRandomPrideMessage, type PrideMessage } from "@/lib/prideMessages";

type PrideContextValue = {
  message: PrideMessage | null;
  celebrateRun: () => PrideMessage;
};

const PrideContext = createContext<PrideContextValue | null>(null);

export function PrideProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<PrideMessage | null>(null);

  function celebrateRun() {
    const nextMessage = getRandomPrideMessage();
    setMessage(nextMessage);
    return nextMessage;
  }

  return (
    <PrideContext.Provider value={{ message, celebrateRun }}>
      {children}
    </PrideContext.Provider>
  );
}

export function usePride() {
  const context = useContext(PrideContext);
  if (!context) {
    throw new Error("usePride must be used inside PrideProvider");
  }
  return context;
}

export function PrideFrog() {
  const { message } = usePride();
  if (!message) return null;

  return (
    <div className="pointer-events-none absolute right-0 top-2 z-30 h-[104px] w-[220px]">
      <div
        className="pride-speech absolute right-0 top-0 max-w-[204px] rounded-2xl border border-brand/15 bg-card px-3 py-2 text-right text-[11px] leading-tight text-foreground shadow-sm"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message}
        <span className="absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-brand/15 bg-card" />
      </div>

      <div
        className="pride-frog-art absolute bottom-0 right-5 h-[50px] w-[68px]"
        aria-hidden="true"
      >
        <span className="pride-frog-body" />
        <span className="pride-frog-eye pride-frog-eye-left" />
        <span className="pride-frog-eye pride-frog-eye-right" />
        <span className="pride-frog-smile" />
      </div>
    </div>
  );
}
