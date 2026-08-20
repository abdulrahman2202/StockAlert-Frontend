import type { HistoricalPrice, PriceRange, Stock } from "@/types/stock";

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeries(
  seed: number,
  endPrice: number,
  points: number,
  stepMs: number,
  volatility: number
): HistoricalPrice[] {
  const rnd = mulberry32(seed);
  const series: HistoricalPrice[] = [];
  const now = Date.now();
  let price = endPrice;
  for (let i = points - 1; i >= 0; i--) {
    series.push({ timestamp: now - i * stepMs, price });
    const change = (rnd() - 0.5) * 2 * volatility;
    price = price / (1 + change);
  }
  series.reverse();
  return series;
}

interface StockSeed {
  symbol: string;
  companyName: string;
  exchange: string;
  currentPrice: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  seed: number;
}

function makeStock(seed: StockSeed): Stock {
  const intraday = generateSeries(seed.seed, seed.currentPrice, 120, 3 * 60 * 1000, 0.004);
  const series: Record<PriceRange, HistoricalPrice[]> = {
    "1D": intraday,
    "1W": generateSeries(seed.seed + 1, seed.currentPrice, 100, 1.5 * 60 * 60 * 1000, 0.006),
    "1M": generateSeries(seed.seed + 2, seed.currentPrice, 90, 4 * 60 * 60 * 1000, 0.01),
    "3M": generateSeries(seed.seed + 3, seed.currentPrice, 130, 24 * 60 * 60 * 1000, 0.015),
    "1Y": generateSeries(seed.seed + 4, seed.currentPrice, 260, 24 * 60 * 60 * 1000, 0.02),
  };

  const prices = series["1D"].map((p) => p.price);
  const dayHigh = Math.max(seed.currentPrice, seed.previousClose, ...prices);
  const dayLow = Math.min(seed.currentPrice, seed.previousClose, ...prices);
  const change = seed.currentPrice - seed.previousClose;
  const changePercent = (change / seed.previousClose) * 100;

  return {
    symbol: seed.symbol,
    companyName: seed.companyName,
    exchange: seed.exchange,
    currentPrice: seed.currentPrice,
    previousClose: seed.previousClose,
    change,
    changePercent,
    dayHigh,
    dayLow,
    volume: seed.volume,
    marketCap: seed.marketCap,
    historicalPrices: series,
  };
}

const seeds: StockSeed[] = [
  {
    symbol: "RELIANCE",
    companyName: "Reliance Industries",
    exchange: "NSE",
    currentPrice: 1426.5,
    previousClose: 1410,
    volume: 4210000,
    marketCap: 9.65e12,
    seed: 101,
  },
  {
    symbol: "TCS",
    companyName: "Tata Consultancy Services",
    exchange: "NSE",
    currentPrice: 2968.4,
    previousClose: 2955.2,
    volume: 1130000,
    marketCap: 1.074e13,
    seed: 102,
  },
  {
    symbol: "INFY",
    companyName: "Infosys",
    exchange: "NSE",
    currentPrice: 1585.75,
    previousClose: 1598.1,
    volume: 5620000,
    marketCap: 6.58e12,
    seed: 103,
  },
  {
    symbol: "HDFCBANK",
    companyName: "HDFC Bank",
    exchange: "NSE",
    currentPrice: 1691.2,
    previousClose: 1671,
    volume: 2780000,
    marketCap: 9.42e12,
    seed: 104,
  },
  {
    symbol: "ICICIBANK",
    companyName: "ICICI Bank",
    exchange: "NSE",
    currentPrice: 1247.3,
    previousClose: 1239.85,
    volume: 3840000,
    marketCap: 8.77e12,
    seed: 105,
  },
  {
    symbol: "SBIN",
    companyName: "State Bank of India",
    exchange: "NSE",
    currentPrice: 842.65,
    previousClose: 849.2,
    volume: 9210000,
    marketCap: 7.52e12,
    seed: 106,
  },
  {
    symbol: "ITC",
    companyName: "ITC Limited",
    exchange: "NSE",
    currentPrice: 452.8,
    previousClose: 449.95,
    volume: 7560000,
    marketCap: 5.66e12,
    seed: 107,
  },
  {
    symbol: "WIPRO",
    companyName: "Wipro",
    exchange: "NSE",
    currentPrice: 487.55,
    previousClose: 492.3,
    volume: 4120000,
    marketCap: 2.55e12,
    seed: 108,
  },
  {
    symbol: "LT",
    companyName: "Larsen & Toubro",
    exchange: "NSE",
    currentPrice: 3612.4,
    previousClose: 3589.75,
    volume: 945000,
    marketCap: 4.95e12,
    seed: 109,
  },
  {
    symbol: "BHARTIARTL",
    companyName: "Bharti Airtel",
    exchange: "NSE",
    currentPrice: 1478.25,
    previousClose: 1485.6,
    volume: 3210000,
    marketCap: 8.72e12,
    seed: 110,
  },
];

export const mockStocks: Stock[] = seeds.map(makeStock);
