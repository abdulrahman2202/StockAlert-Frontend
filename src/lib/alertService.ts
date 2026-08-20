import type {
  Alert,
  AlertCondition,
  AlertStatus,
  NewAlertInput,
} from "@/types/alert";

const STORAGE_KEY = "stockalert:alerts:v1";

export function createAlertId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Service layer for alerts.
 *
 * Replace these with GET/POST /alerts and PATCH/DELETE /alerts/:id when a
 * backend becomes available.
 */

export function createAlert(input: NewAlertInput): Alert {
  return {
    id: createAlertId(),
    stockSymbol: input.stockSymbol,
    stockName: input.stockName,
    condition: input.condition,
    targetPrice: input.targetPrice,
    currentPrice: input.currentPrice,
    status: "ACTIVE",
    createdAt: Date.now(),
    triggeredAt: null,
    notificationType: input.notificationType,
  };
}

export function withStatus(alert: Alert, status: AlertStatus): Alert {
  return { ...alert, status };
}

export function conditionLabel(
  condition: AlertCondition,
  targetPrice: number
): string {
  switch (condition) {
    case "ABOVE":
      return `Price above ₹${targetPrice.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`;
    case "BELOW":
      return `Price below ₹${targetPrice.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`;
    case "PERCENT_CHANGE":
      return `Price changes by ${targetPrice}%`;
  }
}

export function loadAlerts(): Alert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Alert[]) : [];
  } catch {
    return [];
  }
}

export function saveAlerts(alerts: Alert[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}