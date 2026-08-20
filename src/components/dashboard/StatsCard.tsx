import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  up?: boolean;
  down?: boolean;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  up,
  down,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
          {description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-lg",
            up
              ? "bg-emerald-500/10 text-emerald-600"
              : down
                ? "bg-red-500/10 text-red-600"
                : "bg-accent text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>
        {up !== undefined && (
          <span className="sr-only">
            {up ? "Up" : down ? "Down" : "Neutral"}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export function TrendLabel({ up }: { up: boolean }) {
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-emerald-600" : "text-red-600"
      )}
    >
      <Icon className="size-3.5" />
      {up ? "Up today" : "Down today"}
    </span>
  );
}