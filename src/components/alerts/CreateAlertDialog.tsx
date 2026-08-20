"use client";

import { useState } from "react";
import { BellRing, IndianRupee, Percent } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStockContext } from "@/context/StockProvider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AlertCondition, NotificationType } from "@/types/alert";
import type { Stock } from "@/types/stock";

const CONDITION_OPTIONS: { value: AlertCondition; label: string }[] = [
  { value: "ABOVE", label: "Price goes above" },
  { value: "BELOW", label: "Price goes below" },
  { value: "PERCENT_CHANGE", label: "Price changes by %" },
];

const NOTIFICATION_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: "BROWSER", label: "Browser notification" },
  { value: "EMAIL", label: "Email" },
];

interface CreateAlertDialogProps {
  stock?: Stock;
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  triggerSize?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  ariaLabel?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateAlertDialog({
  stock: propStock,
  triggerLabel = "Create Price Alert",
  triggerVariant = "default",
  triggerSize = "default",
  ariaLabel = "Create Price Alert",
  defaultOpen = false,
  onOpenChange,
  onCreated,
}: CreateAlertDialogProps) {
  const { stocks, createAlert } = useStockContext();

  const [open, setOpen] = useState(defaultOpen);
  const [selectedSymbol, setSelectedSymbol] = useState(
    propStock?.symbol ?? stocks[0]?.symbol ?? ""
  );
  const [condition, setCondition] = useState<AlertCondition>("ABOVE");
  const [target, setTarget] = useState("");
  const [notificationType, setNotificationType] =
    useState<NotificationType>("BROWSER");
  const [error, setError] = useState<string | null>(null);

  const stock =
    propStock ?? stocks.find((s) => s.symbol === selectedSymbol);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
    if (!next) {
      setError(null);
    }
  };

  const handleConditionChange = (value: string | null) => {
    if (!value) return;
    setCondition(value as AlertCondition);
    setError(null);
  };

  const handleTargetChange = (value: string) => {
    setTarget(value);
    setError(null);
  };

  const handleSubmit = () => {
    if (!stock) return;

    const numericTarget = Number(target);
    if (target.trim() === "" || !Number.isFinite(numericTarget)) {
      setError("Please enter a valid number.");
      return;
    }
    if (numericTarget <= 0) {
      setError("Target must be greater than zero.");
      return;
    }

    if (condition === "ABOVE" && numericTarget <= stock.currentPrice) {
      setError(
        `Target must be above the current price of ${formatPrice(stock.currentPrice)}.`
      );
      return;
    }
    if (condition === "BELOW" && numericTarget >= stock.currentPrice) {
      setError(
        `Target must be below the current price of ${formatPrice(stock.currentPrice)}.`
      );
      return;
    }

    createAlert({
      stockSymbol: stock.symbol,
      stockName: stock.companyName,
      condition,
      targetPrice: numericTarget,
      currentPrice: stock.currentPrice,
      notificationType,
    });

    toast.success("Alert created successfully.");
    setTarget("");
    setCondition("ABOVE");
    setNotificationType("BROWSER");
    setOpen(false);
    onCreated?.();
  };

  const isPercent = condition === "PERCENT_CHANGE";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant={triggerVariant}
            size={triggerSize}
            aria-label={ariaLabel}
          >
            <BellRing className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            We&apos;ll notify you when the price condition is met.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {!propStock && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="alert-stock">Stock</Label>
              <Select
                value={selectedSymbol}
                onValueChange={(value) => {
                  if (value) setSelectedSymbol(value);
                }}
              >
                <SelectTrigger id="alert-stock" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stocks.map((s) => (
                    <SelectItem key={s.symbol} value={s.symbol}>
                      {s.symbol} — {s.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {stock && (
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2.5">
              <div>
                <p className="text-sm font-medium">{stock.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {stock.companyName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {formatPrice(stock.currentPrice)}
                </p>
                <p className="text-xs text-muted-foreground">Current Price</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alert-condition">Condition</Label>
            <Select
              value={condition}
              onValueChange={handleConditionChange}
            >
              <SelectTrigger id="alert-condition" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alert-target">
              {isPercent ? "Target (%)" : "Target"}
            </Label>
            <div className="relative">
              {!isPercent && (
                <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">
                  <IndianRupee className="size-4" />
                </span>
              )}
              <Input
                id="alert-target"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder={isPercent ? "e.g. 2" : "e.g. 1500"}
                value={target}
                onChange={(e) => handleTargetChange(e.target.value)}
                className={cn(
                  !isPercent && "pl-8",
                  isPercent && "pr-8"
                )}
                aria-invalid={Boolean(error)}
              />
              {isPercent && (
                <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground">
                  <Percent className="size-4" />
                </span>
              )}
            </div>
            {error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : (
              stock && !isPercent && (
                <p className="text-xs text-muted-foreground">
                  {condition === "ABOVE"
                    ? `Trigger when price rises above the target.`
                    : `Trigger when price falls below the target.`}
                </p>
              )
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="alert-notification">Notification</Label>
            <Select
              value={notificationType}
              onValueChange={(value) => {
                if (value) setNotificationType(value as NotificationType);
              }}
            >
              <SelectTrigger id="alert-notification" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTIFICATION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Notification delivery is simulated in this preview.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <BellRing className="size-4" />
            Create Alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}