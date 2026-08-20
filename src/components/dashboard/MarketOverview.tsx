"use client";

import { Star } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/stocks/StockCard";
import { useStockContext } from "@/context/StockProvider";

export function MarketOverview() {
  const { watchlist } = useStockContext();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Market Overview</CardTitle>
        <span className="text-xs text-muted-foreground">
          {watchlist.length} {watchlist.length === 1 ? "stock" : "stocks"}
        </span>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Star className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className="font-medium">
                No stocks in your watchlist yet.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add stocks you want to monitor to see them here.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document
                  .getElementById("popular-stocks")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Add Stock
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {watchlist.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}