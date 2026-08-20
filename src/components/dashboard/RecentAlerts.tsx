"use client";

import Link from "next/link";
import { ArrowRight, BellRing, CheckCircle2, PauseCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStockContext } from "@/context/StockProvider";
import { conditionLabel } from "@/lib/alertService";
import { formatTimeAgoShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RecentAlerts() {
  const { alerts } = useStockContext();

  const recent = [...alerts]
    .sort((a, b) => (b.triggeredAt ?? b.createdAt) - (a.triggeredAt ?? a.createdAt))
    .slice(0, 5);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Recent Alerts</CardTitle>
        <Badge variant="secondary">{alerts.length} total</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {recent.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <BellRing className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className="font-medium">You haven&apos;t created any alerts yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Set a target and get notified when a stock hits it.
              </p>
            </div>
            <Button size="sm" nativeButton={false} render={<Link href="/alerts" />}>
              Create Alert
            </Button>
          </div>
        ) : (
          <ul className="flex flex-1 flex-col divide-y">
            {recent.map((alert) => {
              const triggered = alert.status === "TRIGGERED";
              return (
                <li key={alert.id} className="flex items-center gap-3 py-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      triggered
                        ? "bg-emerald-500/10 text-emerald-600"
                        : alert.status === "DISABLED"
                          ? "bg-muted text-muted-foreground"
                          : "bg-accent text-foreground"
                    )}
                  >
                    {triggered ? (
                      <CheckCircle2 className="size-4" />
                    ) : alert.status === "DISABLED" ? (
                      <PauseCircle className="size-4" />
                    ) : (
                      <BellRing className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {alert.stockSymbol}
                      {triggered && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                        >
                          Triggered
                        </Badge>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {conditionLabel(alert.condition, alert.targetPrice)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatTimeAgoShort(alert.triggeredAt ?? alert.createdAt)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-4 border-t pt-3">
          <Button variant="outline" size="sm" className="w-full" nativeButton={false} render={<Link href="/alerts" />}>
            View all alerts
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}