import * as React from "react";
import { cn } from "@/lib/cn";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-5 pt-3", className)} {...props} />
);
