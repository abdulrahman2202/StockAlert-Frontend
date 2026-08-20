"use client";

import Link from "next/link";
import { BellRing, Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStockContext } from "@/context/StockProvider";
import { formatChange, formatPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Stock } from "@/types/stock";

interface StockListProps {
  stocks: Stock[];
}

export function StockList({ stocks }: StockListProps) {
  const { alerts, removeFromWatchlist } = useStockContext();

  return (
    <Card>
      <CardContent className="p-0">
        <div className="hidden grid-cols-[1.2fr_1.6fr_1fr_1fr_1fr_0.7fr_auto_auto] gap-3 border-b px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <span>Symbol</span>
          <span>Company</span>
          <span className="text-right">Price</span>
          <span className="text-right">Change</span>
          <span className="text-right">Change %</span>
          <span className="text-center">Alerts</span>
          <span className="w-16 text-right">View</span>
          <span className="w-16 text-right">Remove</span>
        </div>
        <ul className="divide-y">
          {stocks.map((stock) => {
            const up = stock.change >= 0;
            const alertCount = alerts.filter(
              (a) => a.stockSymbol === stock.symbol
            ).length;
            return (
              <li
                key={stock.symbol}
                className="grid grid-cols-2 items-center gap-x-3 gap-y-2 px-5 py-4 transition-colors hover:bg-accent/40 md:grid-cols-[1.2fr_1.6fr_1fr_1fr_1fr_0.7fr_auto_auto]"
              >
                <Link
                  href={`/stocks/${stock.symbol}`}
                  className="font-semibold hover:underline"
                >
                  {stock.symbol}
                </Link>
                <span className="hidden truncate text-muted-foreground md:block">
                  {stock.companyName}
                </span>
                <span className="text-right font-medium tabular-nums md:block">
                  {formatPrice(stock.currentPrice)}
                </span>
                <span
                  className={cn(
                    "hidden text-right tabular-nums md:block",
                    up ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {formatChange(stock.change)}
                </span>
                <span
                  className={cn(
                    "text-right tabular-nums md:text-left",
                    up ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {formatPercent(stock.changePercent)}
                </span>
                <span className="hidden justify-center md:flex">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">
                    <BellRing className="size-3" />
                    {alertCount}
                  </span>
                </span>
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`View ${stock.symbol}`}
                    nativeButton={false}
                    render={<Link href={`/stocks/${stock.symbol}`} />}
                  >
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    aria-label={`Remove ${stock.symbol} from watchlist`}
                    onClick={() => removeFromWatchlist(stock.symbol)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}