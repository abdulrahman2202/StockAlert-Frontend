"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, TrendingDown, TrendingUp } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatPercent } from "@/lib/format";
import { searchStocks } from "@/lib/stockService";
import { cn } from "@/lib/utils";

interface StockSearchProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSelect?: () => void;
}

export function StockSearch({
  className,
  placeholder = "Search stocks...",
  autoFocus = false,
  onSelect,
}: StockSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = searchStocks(query);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const handleSelect = (symbol: string) => {
    setOpen(false);
    setQuery("");
    onSelect?.();
    router.push(`/stocks/${symbol}`);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
              className
            )}
          >
            <Search className="size-4 shrink-0" />
            <span className="truncate">{placeholder}</span>
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-80 p-0 sm:w-96"
      >
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by symbol or company"
            className="h-7 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ScrollArea className="max-h-72">
          {query.trim().length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Start typing to search stocks
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              No stocks found for “{query.trim()}”
            </div>
          ) : (
            <ul className="p-1">
              {results.map((stock) => {
                const up = stock.changePercent >= 0;
                const Icon = up ? TrendingUp : TrendingDown;
                return (
                  <li key={stock.symbol}>
                    <button
                      type="button"
                      onClick={() => handleSelect(stock.symbol)}
                      className="flex w-full items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {stock.symbol}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {stock.companyName} · {stock.exchange}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 text-sm">
                        <span className="tabular-nums">
                          ₹
                          {stock.currentPrice.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                        <span
                          className={cn(
                            "flex items-center gap-0.5 text-xs",
                            up ? "text-emerald-600" : "text-red-600"
                          )}
                        >
                          <Icon className="size-3" />
                          {formatPercent(stock.changePercent)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}