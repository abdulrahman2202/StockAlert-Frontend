"use client";

import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  PauseCircle,
  Play,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStockContext } from "@/context/StockProvider";
import { conditionLabel } from "@/lib/alertService";
import { formatPrice, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Alert } from "@/types/alert";

const statusStyles: Record<Alert["status"], string> = {
  ACTIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500",
  TRIGGERED: "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-500",
  DISABLED: "bg-muted text-muted-foreground",
};

export function AlertCard({ alert }: { alert: Alert }) {
  const { getStock, setAlertStatus, deleteAlert } = useStockContext();
  const stock = getStock(alert.stockSymbol);
  const currentPrice = stock?.currentPrice ?? alert.currentPrice;
  const up = (stock?.change ?? 0) >= 0;

  const isDisabled = alert.status === "DISABLED";
  const isTriggered = alert.status === "TRIGGERED";

  const conditionText = conditionLabel(alert.condition, alert.targetPrice);

  return (
    <Card
      className={cn(
        "transition-colors",
        isDisabled && "opacity-60",
        isTriggered && "ring-1 ring-blue-500/30"
      )}
    >
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/stocks/${alert.stockSymbol}`}
            className="flex min-w-0 items-center gap-2.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              {alert.stockSymbol.slice(0, 3)}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {alert.stockSymbol}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {alert.stockName}
              </span>
            </span>
          </Link>
          <Badge variant="outline" className={statusStyles[alert.status]}>
            {isTriggered && <CheckCircle2 className="size-3" />}
            {isDisabled && <PauseCircle className="size-3" />}
            {!isTriggered && !isDisabled && <BellRing className="size-3" />}
            {alert.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground">Condition</p>
            <p className="mt-0.5 font-medium">{conditionText}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current</p>
            <p className="mt-0.5 font-medium tabular-nums">
              {formatPrice(currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="mt-0.5 font-medium">
              {formatRelativeTime(alert.createdAt)}
            </p>
          </div>
        </div>

        {isTriggered && (
          <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2.5 text-sm text-blue-700 dark:text-blue-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span className="min-w-0">
              Triggered at{" "}
              <span className="font-semibold tabular-nums">
                {formatPrice(alert.triggeredAt ? alert.currentPrice : currentPrice)}
              </span>{" "}
              · {alert.triggeredAt ? formatRelativeTime(alert.triggeredAt) : ""}
            </span>
          </div>
        )}

        <div className="mt-1 flex items-center justify-between gap-2 border-t pt-3">
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              isDisabled
                ? "text-muted-foreground"
                : up
                  ? "text-emerald-600 dark:text-emerald-500"
                  : "text-red-600 dark:text-red-500"
            )}
          >
            {isDisabled ? (
              "Paused"
            ) : (
              <>
                {up ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {stock ? `${stock.symbol} is ${up ? "up" : "down"} today` : "Stock unavailable"}
              </>
            )}
          </span>
          <div className="flex items-center gap-1">
            {isDisabled ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertStatus(alert.id, "ACTIVE")}
              >
                <Play className="size-3.5" />
                Enable
              </Button>
            ) : (
              !isTriggered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlertStatus(alert.id, "DISABLED")}
                >
                  <PauseCircle className="size-3.5" />
                  Disable
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10"
              aria-label={`Delete alert for ${alert.stockSymbol}`}
              onClick={() => deleteAlert(alert.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}