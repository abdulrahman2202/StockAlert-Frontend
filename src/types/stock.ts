export type PriceRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface HistoricalPrice {
  timestamp: number;
  price: number;
}

export interface Stock {
  symbol: string;
  companyName: string;
  exchange: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  historicalPrices: Record<PriceRange, HistoricalPrice[]>;
}

export interface StockSearchResult {
  symbol: string;
  companyName: string;
  exchange: string;
  currentPrice: number;
  changePercent: number;
}
