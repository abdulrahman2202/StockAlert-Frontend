"use client";

import { BellRing, CheckCircle2, Star, TrendingUp } from "lucide-react";

import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StockCard } from "@/components/stocks/StockCard";
import { StockSearch } from "@/components/stocks/StockSearch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStockContext } from "@/context/StockProvider";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning 👋";
  if (hour < 17) return "Good afternoon 👋";
  return "Good evening 👋";
}

export default function Home() {
  const { stocks, watchlist, alerts } = useStockContext();

  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE").length;
  const triggeredAlerts = alerts.filter((a) => a.status === "TRIGGERED").length;
  const stocksUp = stocks.filter((s) => s.change >= 0).length;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {greeting()}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Monitor your stocks and get notified when prices reach your
              targets.
            </p>
          </div>
          <div className="max-w-xl sm:hidden">
            <StockSearch />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Watchlist Stocks"
            value={watchlist.length}
            icon={Star}
            description="Stocks you are tracking"
          />
          <StatsCard
            title="Active Alerts"
            value={activeAlerts}
            icon={BellRing}
            description="Waiting for price targets"
          />
          <StatsCard
            title="Triggered Alerts"
            value={triggeredAlerts}
            icon={CheckCircle2}
            up={triggeredAlerts > 0}
            description="Conditions already met"
          />
          <StatsCard
            title="Stocks Up Today"
            value={`${stocksUp}/${stocks.length}`}
            icon={TrendingUp}
            up={stocksUp >= stocks.length / 2}
            description="Trading higher today"
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <MarketOverview />
          </div>
          <RecentAlerts />
        </section>

        <section id="popular-stocks" className="scroll-mt-24">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Popular Stocks
            </h2>
            <Badge variant="outline">Demo data</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stocks.map((stock) => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>About this preview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Prices shown here are simulated mock values for demonstration only.
              They are not live market data. Prices update automatically every
              few seconds so you can preview how alerts will behave once a real
              data feed is connected.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}