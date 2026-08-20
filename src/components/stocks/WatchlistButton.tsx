"use client";

import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStockContext } from "@/context/StockProvider";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  symbol: string;
  size?: "icon" | "sm" | "default" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function WatchlistButton({
  symbol,
  size = "icon",
  showLabel = false,
  className,
}: WatchlistButtonProps) {
  const { isWatchlisted, addToWatchlist, removeFromWatchlist } =
    useStockContext();
  const watched = isWatchlisted(symbol);

  const handleToggle = () => {
    if (watched) {
      removeFromWatchlist(symbol);
    } else {
      addToWatchlist(symbol);
    }
  };

  return (
    <Button
      variant={watched ? "secondary" : "outline"}
      size={showLabel ? "default" : size}
      aria-pressed={watched}
      aria-label={
        watched ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`
      }
      className={cn(showLabel && "gap-2", className)}
      onClick={handleToggle}
    >
      <Star
        className={cn(
          "size-4",
          watched && "fill-amber-400 text-amber-400"
        )}
      />
      {showLabel && (watched ? "Watching" : "Watch")}
    </Button>
  );
}