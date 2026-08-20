const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatNumber(value: number): string {
  return compactFormatter.format(value);
}

export function formatChange(value: number): string {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${priceFormatter.format(Math.abs(value))}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatVolume(value: number): string {
  const lakh = value / 100000;
  if (lakh >= 100) {
    return `${(lakh / 100).toFixed(2)}Cr`;
  }
  return `${lakh.toFixed(2)}L`;
}

export function formatMarketCap(value: number): string {
  const crore = value / 1e7;
  if (crore >= 100000) {
    return `₹${(crore / 100000).toFixed(1)}L Cr`;
  }
  return `₹${Math.round(crore)} Cr`;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return `${seconds} seconds ago`;
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatTimeAgoShort(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}