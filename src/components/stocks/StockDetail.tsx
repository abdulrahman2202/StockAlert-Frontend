"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BellRing,
  ChevronDown,
  Globe,
  Landmark,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StockChart } from "@/components/stocks/StockChart";
import { WatchlistButton } from "@/components/stocks/WatchlistButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStockContext } from "@/context/StockProvider";
import {
  formatChange,
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatVolume,
} from "@/lib/format";
import { cn } from "@/lib/utils";

interface StatItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export function StockDetail({ symbol }: { symbol: string }) {
  const { getStock, alerts } = useStockContext();
  const stock = getStock(symbol);

  if (!stock) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-lg font-medium">Stock not found</p>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find “{symbol}” in the demo data.
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const up = stock.change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const alertCount = alerts.filter((a) => a.stockSymbol === stock.symbol).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Dashboard
          </Link>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-sm font-semibold">
              {stock.symbol.slice(0, 3)}
            </span>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                {stock.symbol}
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {stock.exchange}
                </Badge>
              </h1>
              <p className="text-sm text-muted-foreground">
                {stock.companyName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <WatchlistButton symbol={stock.symbol} showLabel />
            <CreateAlertDialog stock={stock} />
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">Current Price</p>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-semibold tabular-nums tracking-tight">
                  {formatPrice(stock.currentPrice)}
                </p>
                <span
                  className={cn(
                    "flex items-center gap-1 text-lg font-medium tabular-nums",
                    up ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                  )}
                >
                  <Icon className="size-5" />
                  {formatChange(stock.change)}
                </span>
                <span
                  className={cn(
                    "text-base font-medium tabular-nums",
                    up ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
                  )}
                >
                  {formatPercent(stock.changePercent)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BellRing className="size-4" />
                <Link href="/alerts" className="underline-offset-4 hover:underline">
                  {alertCount} {alertCount === 1 ? "alert" : "alerts"} for this stock
                </Link>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Simulated price for preview only — not live market data.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatItem
            label="Day High"
            value={formatPrice(stock.dayHigh)}
            icon={<TrendingUp className="size-4" />}
          />
          <StatItem
            label="Day Low"
            value={formatPrice(stock.dayLow)}
            icon={<TrendingDown className="size-4" />}
          />
          <StatItem
            label="Previous Close"
            value={formatPrice(stock.previousClose)}
            icon={<ChevronDown className="size-4" />}
          />
          <StatItem
            label="Volume"
            value={formatVolume(stock.volume)}
            icon={<Globe className="size-4" />}
          />
          <StatItem
            label="Market Cap"
            value={formatMarketCap(stock.marketCap)}
            icon={<Landmark className="size-4" />}
          />
          <StatItem
            label="Exchange"
            value={stock.exchange}
            icon={<Globe className="size-4" />}
          />
        </div>

        <StockChart stock={stock} />
      </div>
    </DashboardLayout>
  );
}