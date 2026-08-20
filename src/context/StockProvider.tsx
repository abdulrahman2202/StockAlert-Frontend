"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { initialAlerts } from "@/data/mockAlerts";
import { mockStocks } from "@/data/mockStocks";
import {
  createAlert as createAlertEntity,
  loadAlerts,
  saveAlerts,
  withStatus,
} from "@/lib/alertService";
import { evaluateAlerts, simulatePriceMove } from "@/lib/priceSimulator";
import { initSound, playBell } from "@/lib/sound";
import { loadWatchlist, saveWatchlist } from "@/lib/stockService";
import { loadJSON, saveJSON } from "@/lib/storage";
import type {
  Alert,
  AlertStatus,
  NewAlertInput,
  Notification,
} from "@/types/alert";
import type { Stock } from "@/types/stock";

const TICK_INTERVAL_MS = 5000;
const NOTIFICATIONS_KEY = "stockalert:notifications:v1";

interface StockContextValue {
  stocks: Stock[];
  getStock: (symbol: string) => Stock | undefined;
  watchlist: Stock[];
  isWatchlisted: (symbol: string) => boolean;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  alerts: Alert[];
  createAlert: (input: NewAlertInput) => void;
  deleteAlert: (id: string) => void;
  setAlertStatus: (id: string, status: AlertStatus) => void;
  notifications: Notification[];
  unreadCount: number;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const StockContext = createContext<StockContextValue | undefined>(undefined);

function notificationFor(alert: Alert): Notification {
  const target = alert.targetPrice.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
  });
  let message: string;
  switch (alert.condition) {
    case "ABOVE":
      message = `${alert.stockName} crossed ₹${target}`;
      break;
    case "BELOW":
      message = `${alert.stockName} dropped below ₹${target}`;
      break;
    case "PERCENT_CHANGE":
      message = `${alert.stockName} moved ${alert.targetPrice}%`;
      break;
  }
  return {
    id: alert.id,
    title: `${alert.stockSymbol} alert triggered`,
    message,
    createdAt: Date.now(),
    read: false,
  };
}

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [stocks, setStocks] = useState<Stock[]>(mockStocks);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const stocksRef = useRef(stocks);
  const alertsRef = useRef(alerts);

  useEffect(() => {
    stocksRef.current = stocks;
    alertsRef.current = alerts;
  });

  /* eslint-disable react-hooks/set-state-in-effect -- One-time hydration of persisted client state on mount. */
  useEffect(() => {
    setWatchlist(loadWatchlist());
    setAlerts(() => {
      const stored = loadAlerts();
      return stored.length > 0 ? stored : initialAlerts;
    });
    setNotifications(loadJSON<Notification[]>(NOTIFICATIONS_KEY, []));
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    saveWatchlist(watchlist);
  }, [watchlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveAlerts(alerts);
  }, [alerts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveJSON(NOTIFICATIONS_KEY, notifications);
  }, [notifications, hydrated]);

  useEffect(() => {
    const warmUp = () => initSound();
    window.addEventListener("pointerdown", warmUp, { once: true });
    window.addEventListener("keydown", warmUp, { once: true });
    return () => {
      window.removeEventListener("pointerdown", warmUp);
      window.removeEventListener("keydown", warmUp);
    };
  }, []);

  const handleTick = useCallback(() => {
    const currentStocks = stocksRef.current;
    const currentAlerts = alertsRef.current;

    const updatedStocks = currentStocks.map((stock) => {
      if (Math.random() < 0.45) return stock;
      return simulatePriceMove(stock);
    });

    const { alerts: updatedAlerts, triggered } = evaluateAlerts(
      currentAlerts,
      updatedStocks
    );

    setStocks(updatedStocks);
    setAlerts(updatedAlerts);

    if (triggered.length > 0) {
      playBell();
      const newNotifications = triggered.map(notificationFor);
      setNotifications((prev) => [...newNotifications, ...prev].slice(0, 50));
      for (const alert of triggered) {
        toast(alert.stockName, {
          description: notificationFor(alert).message,
        });
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(handleTick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [handleTick]);

  const getStock = useCallback(
    (symbol: string) =>
      stocks.find(
        (stock) => stock.symbol.toLowerCase() === symbol.toLowerCase()
      ),
    [stocks]
  );

  const isWatchlisted = useCallback(
    (symbol: string) =>
      watchlist.some((s) => s.toLowerCase() === symbol.toLowerCase()),
    [watchlist]
  );

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.some((s) => s.toLowerCase() === symbol.toLowerCase())
        ? prev
        : [...prev, symbol]
    );
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist((prev) =>
      prev.filter((s) => s.toLowerCase() !== symbol.toLowerCase())
    );
  }, []);

  const createAlert = useCallback((input: NewAlertInput) => {
    setAlerts((prev) => [createAlertEntity(input), ...prev]);
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const setAlertStatus = useCallback((id: string, status: AlertStatus) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? withStatus(alert, status) : alert))
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const watchlistStocks = useMemo(
    () =>
      watchlist
        .map((symbol) => stocks.find((s) => s.symbol === symbol))
        .filter((stock): stock is Stock => Boolean(stock)),
    [watchlist, stocks]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      stocks,
      getStock,
      watchlist: watchlistStocks,
      isWatchlisted,
      addToWatchlist,
      removeFromWatchlist,
      alerts,
      createAlert,
      deleteAlert,
      setAlertStatus,
      notifications,
      unreadCount,
      markAllNotificationsRead,
      clearNotifications,
    }),
    [
      stocks,
      getStock,
      watchlistStocks,
      isWatchlisted,
      addToWatchlist,
      removeFromWatchlist,
      alerts,
      createAlert,
      deleteAlert,
      setAlertStatus,
      notifications,
      unreadCount,
      markAllNotificationsRead,
      clearNotifications,
    ]
  );

  return (
    <StockContext.Provider value={value}>{children}</StockContext.Provider>
  );
}

export function useStockContext(): StockContextValue {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error("useStockContext must be used within a StockProvider");
  }
  return context;
}