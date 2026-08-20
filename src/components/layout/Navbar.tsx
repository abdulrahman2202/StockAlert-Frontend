"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Settings, TrendingUp } from "lucide-react";

import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { MobileSidebar } from "@/components/layout/Sidebar";
import { StockSearch } from "@/components/stocks/StockSearch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <Link href="/" className="flex items-center gap-2 md:hidden">
        <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TrendingUp className="size-4" />
        </span>
        <span className="text-base font-semibold tracking-tight">
          StockAlert
        </span>
      </Link>

      <div className="mx-auto hidden w-full max-w-md sm:block">
        <StockSearch />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
        <Badge variant="outline" className="hidden lg:inline-flex">
          Demo data
        </Badge>
        <NotificationDropdown />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Settings">
                <Settings className="size-5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Notifications (soon)</DropdownMenuItem>
            <DropdownMenuItem disabled>Theme (coming soon)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}