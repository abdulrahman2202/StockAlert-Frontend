import type { Alert } from "@/types/alert";
import type { HistoricalPrice, PriceRange, Stock } from "@/types/stock";

const MAX_INTRADAY_POINTS = 200;
const TICK_STEP_MS = 5 * 60 * 1000;

/**
 * Mock price engine.
 *
 * Simulates small random price movements so the UI feels alive. Remove this
 * module when a real WebSocket / price feed is connected and replace it with
 * live updates from the server.
 */

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function simulatePriceMove(stock: Stock): Stock {
  const volatility = 0.008;
  const movement = (Math.random() - 0.45) * 2 * volatility;
  const currentPrice = round2(Math.max(stock.currentPrice * (1 + movement), 1));

  const change = currentPrice - stock.previousClose;
  const changePercent = (change / stock.previousClose) * 100;

  const nextIntraday = [
    ...stock.historicalPrices["1D"],
    {
      timestamp: Date.now(),
      price: currentPrice,
    },
  ].slice(-MAX_INTRADAY_POINTS);

  const nextWeek = [
    ...stock.historicalPrices["1W"],
    { timestamp: Date.now(), price: currentPrice },
  ].slice(-200);

  const dayPrices = nextIntraday.map((p) => p.price);
  const dayHigh = Math.max(currentPrice, stock.previousClose, ...dayPrices);
  const dayLow = Math.min(currentPrice, stock.previousClose, ...dayPrices);

  return {
    ...stock,
    currentPrice,
    change,
    changePercent,
    dayHigh: round2(dayHigh),
    dayLow: round2(dayLow),
    historicalPrices: {
      ...stock.historicalPrices,
      "1D": nextIntraday,
      "1W": nextWeek,
    },
  };
}

export function appendHistoryPoint(
  stock: Stock,
  range: Exclude<PriceRange, "1D" | "1W">,
  point: HistoricalPrice
): Stock {
  return {
    ...stock,
    historicalPrices: {
      ...stock.historicalPrices,
      [range]: [...stock.historicalPrices[range], point],
    },
  };
}

export function conditionMet(
  condition: Alert["condition"],
  targetPrice: number,
  stock: Stock
): boolean {
  switch (condition) {
    case "ABOVE":
      return stock.currentPrice >= targetPrice;
    case "BELOW":
      return stock.currentPrice <= targetPrice;
    case "PERCENT_CHANGE":
      return Math.abs(stock.changePercent) >= targetPrice;
  }
}

/**
 * Checks ACTIVE alerts against current prices and returns the updated alert
 * list together with the alerts that just triggered.
 */
export function evaluateAlerts(
  alerts: Alert[],
  stocks: Stock[]
): { alerts: Alert[]; triggered: Alert[] } {
  const stockBySymbol = new Map(stocks.map((s) => [s.symbol, s]));
  const triggered: Alert[] = [];
  const updated = alerts.map((alert) => {
    if (alert.status !== "ACTIVE") return alert;
    const stock = stockBySymbol.get(alert.stockSymbol);
    if (!stock) return alert;
    if (!conditionMet(alert.condition, alert.targetPrice, stock)) return alert;

    const triggeredAlert: Alert = {
      ...alert,
      status: "TRIGGERED",
      triggeredAt: Date.now(),
      currentPrice: stock.currentPrice,
    };
    triggered.push(triggeredAlert);
    return triggeredAlert;
  });
  return { alerts: updated, triggered };
}

export { TICK_STEP_MS };