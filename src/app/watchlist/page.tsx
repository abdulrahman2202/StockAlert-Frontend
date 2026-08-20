"use client";

import { Star } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StockList } from "@/components/stocks/StockList";
import { StockSearch } from "@/components/stocks/StockSearch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStockContext } from "@/context/StockProvider";

export default function WatchlistPage() {
  const { watchlist } = useStockContext();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">
                Watchlist
              </h1>
              <Badge variant="outline">{watchlist.length}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">
              Stocks you are tracking. Add more using the search above.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <StockSearch placeholder="Add stocks..." />
          </div>
        </div>

        {watchlist.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Star className="size-5 text-muted-foreground" />
              </span>
              <div>
                <p className="font-medium">No stocks in your watchlist yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search for a stock above and tap the star to add it to your
                  watchlist.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <StockList stocks={watchlist} />
        )}
      </div>
    </DashboardLayout>
  );
}