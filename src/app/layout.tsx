import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { StockProvider } from "@/context/StockProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockAlert",
  description:
    "Monitor your stocks and get notified when prices reach your targets.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <StockProvider>
          {children}
          <Toaster richColors position="top-right" />
        </StockProvider>
      </body>
    </html>
  );
}