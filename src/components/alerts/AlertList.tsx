"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";

import { CreateAlertDialog } from "@/components/alerts/CreateAlertDialog";
import { AlertCard } from "@/components/alerts/AlertCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStockContext } from "@/context/StockProvider";
import type { AlertStatus } from "@/types/alert";

type Filter = "all" | "ACTIVE" | "TRIGGERED";

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "TRIGGERED", label: "Triggered" },
];

function EmptyState({
  title,
  description,
  showCreate,
}: {
  title: string;
  description: string;
  showCreate?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <BellRing className="size-5 text-muted-foreground" />
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {showCreate && (
        <CreateAlertDialog triggerLabel="Create Alert" triggerVariant="outline" triggerSize="sm" />
      )}
    </div>
  );
}

export function AlertList() {
  const { alerts } = useStockContext();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.status === filter);

  const byStatus = (status: AlertStatus) =>
    alerts.filter((a) => a.status === status);

  const emptyCopy: Record<Filter, { title: string; description: string; showCreate?: boolean }> = {
    all: {
      title: "You haven't created any alerts yet.",
      description:
        "Set a price target and get notified when a stock reaches it.",
      showCreate: true,
    },
    ACTIVE: {
      title: "No active alerts.",
      description: "Create an alert to start monitoring price targets.",
    },
    TRIGGERED: {
      title: "No triggered alerts.",
      description: "Triggered alerts will appear here once conditions are met.",
    },
  };

  return (
    <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
              <span className="ml-1 text-xs tabular-nums opacity-70">
                {f.value === "all" ? alerts.length : byStatus(f.value as AlertStatus).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <CreateAlertDialog triggerLabel="Create Alert" triggerSize="sm" />
      </div>

      <TabsContent value={filter} className="mt-4">
        {filtered.length === 0 ? (
          <EmptyState {...emptyCopy[filter]} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="ACTIVE" className="mt-4">
        {byStatus("ACTIVE").length === 0 ? (
          <EmptyState {...emptyCopy.ACTIVE} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {byStatus("ACTIVE").map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="TRIGGERED" className="mt-4">
        {byStatus("TRIGGERED").length === 0 ? (
          <EmptyState {...emptyCopy.TRIGGERED} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {byStatus("TRIGGERED").map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}