"use client";

import { AlertList } from "@/components/alerts/AlertList";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";

export default function AlertsPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
            <Badge variant="outline">Demo data</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Manage price alerts and see which conditions have been triggered.
          </p>
        </div>
        <AlertList />
      </div>
    </DashboardLayout>
  );
}