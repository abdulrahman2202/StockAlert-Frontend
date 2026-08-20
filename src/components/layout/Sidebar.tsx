"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, LayoutDashboard, Star, TrendingUp } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/watchlist", label: "Watchlist", icon: Star, exact: false },
  { href: "/alerts", label: "Alerts", icon: BellRing, exact: false },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 px-2 font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <TrendingUp className="size-4" />
      </span>
      <span className="text-lg tracking-tight">StockAlert</span>
    </Link>
  );
}

function useActivePath() {
  const pathname = usePathname();
  return (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);
}

function NavLinks() {
  const isActive = useActivePath();
  return (
    <nav className="flex flex-col gap-1 px-2">
      {navItems.map((item) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r bg-background p-4 md:flex">
      <Brand />
      <NavLinks />
      <div className="mt-auto px-2">
        <div className="rounded-lg border bg-muted/50 px-3 py-2.5">
          <p className="text-xs font-medium text-foreground">Demo data</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Prices are simulated for preview purposes.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-4">
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="flex flex-col gap-6">
          <Brand />
          <NavLinks />
          <div className="mt-auto">
            <div className="rounded-lg border bg-muted/50 px-3 py-2.5">
              <p className="text-xs font-medium text-foreground">Demo data</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Prices are simulated for preview purposes.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}