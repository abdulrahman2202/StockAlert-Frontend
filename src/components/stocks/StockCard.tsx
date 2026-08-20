import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { Card, CardContent } from "@/components/ui/card";
import { WatchlistButton } from "@/components/stocks/WatchlistButton";
import { formatChange, formatPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types/stock";

export function StockCard({ stock }: { stock: Stock }) {
  const up = stock.change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <Card className="transition-colors hover:bg-accent/40">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/stocks/${stock.symbol}`}
            className="group flex min-w-0 items-center gap-2.5"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              {stock.symbol.slice(0, 3)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {stock.symbol}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {stock.companyName}
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <CreateAlertDialog
              stock={stock}
              triggerLabel=""
              triggerVariant="ghost"
              triggerSize="icon"
            />
            <WatchlistButton symbol={stock.symbol} className="shrink-0" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="text-2xl font-semibold tabular-nums">
              {formatPrice(stock.currentPrice)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stock.exchange}
            </p>
          </div>
          <div
            className={cn(
              "flex shrink-0 flex-col items-end",
              up ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
            )}
          >
            <span className="flex items-center gap-1 text-sm font-medium tabular-nums">
              <Icon className="size-3.5" />
              {formatChange(stock.change)}
            </span>
            <span className="text-xs tabular-nums">
              {formatPercent(stock.changePercent)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}