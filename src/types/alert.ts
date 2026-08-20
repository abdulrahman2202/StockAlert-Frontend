export type AlertCondition = "ABOVE" | "BELOW" | "PERCENT_CHANGE";

export type AlertStatus = "ACTIVE" | "TRIGGERED" | "DISABLED";

export type NotificationType = "BROWSER" | "EMAIL";

export interface Alert {
  id: string;
  stockSymbol: string;
  stockName: string;
  condition: AlertCondition;
  /** For ABOVE/BELOW this is a rupee amount. For PERCENT_CHANGE this is a percentage. */
  targetPrice: number;
  /** Snapshot of the price when the alert was created. */
  currentPrice: number;
  status: AlertStatus;
  createdAt: number;
  triggeredAt: number | null;
  notificationType: NotificationType;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: number;
  read: boolean;
}

export interface NewAlertInput {
  stockSymbol: string;
  stockName: string;
  condition: AlertCondition;
  targetPrice: number;
  currentPrice: number;
  notificationType: NotificationType;
}
