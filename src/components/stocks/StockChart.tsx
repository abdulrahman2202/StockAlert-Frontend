"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/format";
import type { PriceRange, Stock } from "@/types/stock";

const RANGES: { key: PriceRange; label: string }[] = [
  { key: "1D", label: "1D" },
  { key: "1W", label: "1W" },
  { key: "1M", label: "1M" },
  { key: "3M", label: "3M" },
  { key: "1Y", label: "1Y" },
];

const rangeFormatter: Record<PriceRange, (ts: number) => string> = {
  "1D": (ts) =>
    new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  "1W": (ts) =>
    new Date(ts).toLocaleDateString("en-IN", { weekday: "short" }),
  "1M": (ts) =>
    new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  "3M": (ts) =>
    new Date(ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  "1Y": (ts) =>
    new Date(ts).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: number;
}) {
  if (!active || !payload?.length || typeof label !== "number") return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="text-xs text-muted-foreground">
        {new Date(label).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="mt-0.5 font-medium tabular-nums">
        {formatPrice(value)}
      </p>
    </div>
  );
}

interface StockChartProps {
  stock: Stock;
}

export function StockChart({ stock }: StockChartProps) {
  const [range, setRange] = useState<PriceRange>("1D");

  const data = useMemo(() => {
    const series = stock.historicalPrices[range];
    return series.map((point) => ({
      timestamp: point.timestamp,
      price: point.price,
    }));
  }, [stock.historicalPrices, range]);

  const up = useMemo(() => {
    const series = stock.historicalPrices[range];
    return series[series.length - 1].price >= series[0].price;
  }, [stock.historicalPrices, range]);

  const stroke = up ? "#059669" : "#dc2626";

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>Price Chart</CardTitle>
        <Tabs value={range} onValueChange={(value) => setRange(value as PriceRange)}>
          <TabsList>
            {RANGES.map((r) => (
              <TabsTrigger key={r.key} value={r.key}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={rangeFormatter[range]}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                minTickGap={32}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(value: number) =>
                  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                }
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                width={56}
                orientation="right"
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#gradient-${stock.symbol})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}