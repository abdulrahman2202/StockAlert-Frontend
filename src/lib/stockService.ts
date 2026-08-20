import { mockStocks } from "@/data/mockStocks";
import type { Stock, StockSearchResult } from "@/types/stock";

const STORAGE_KEY = "stockalert:watchlist:v1";

/**
 * Service layer for stock data.
 *
 * These functions currently read from mock data. When a real backend is
 * available, replace the internals with the documented API calls while keeping
 * the same signatures.
 */

export function getStocks(): Stock[] {
  return mockStocks;
}

export function getStockBySymbol(symbol: string): Stock | undefined {
  return mockStocks.find(
    (stock) => stock.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

/** GET /stocks?q=... (mock) */
export function searchStocks(query: string, limit = 8): StockSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return mockStocks
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(q) ||
        stock.companyName.toLowerCase().includes(q)
    )
    .slice(0, limit)
    .map((stock) => ({
      symbol: stock.symbol,
      companyName: stock.companyName,
      exchange: stock.exchange,
      currentPrice: stock.currentPrice,
      changePercent: stock.changePercent,
    }));
}

/** Mock watchlist storage. Replace with GET/POST /watchlist later. */
export function loadWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(symbols: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
}