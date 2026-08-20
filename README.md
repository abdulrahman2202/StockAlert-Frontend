# StockAlert — Frontend

A Next.js 16 dashboard that lets you monitor NSE stocks, build a watchlist, and
create price alerts that trigger in real time. It is a **frontend-only demo
app** — there is no backend. Prices are simulated client-side so you can
experience the full alert lifecycle without live market data.

---

## Table of Contents

- [Tech Stack & Packages](#tech-stack--packages)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Routes / Pages](#routes--pages)
- [Features & How They Work](#features--how-they-work)
  - [Live Price Simulation](#live-price-simulation)
  - [Watchlist](#watchlist)
  - [Stock Search](#stock-search)
  - [Price Alerts](#price-alerts)
  - [Notifications](#notifications)
  - [Alert Sound (Bell)](#alert-sound-bell)
  - [Charts](#charts)
- [Demo Data](#demo-data)
- [Persistence & Reset](#persistence--reset)
- [Scripts](#scripts)

---

## Tech Stack & Packages

| Package | Version | Purpose |
| --- | --- | --- |
| `next` | 16.3.0 | App Router framework, routing, SSR/SSG |
| `react` / `react-dom` | 19.2.8 | UI rendering |
| `@base-ui/react` | ^1.7.0 | Headless primitives (button, menu, dialog, select, popover, tabs, sheet, switch) |
| `class-variance-authority` | ^0.7.1 | Variant API for the shadcn-style `ui/*` components |
| `clsx` | ^2.1.1 | Conditional class names |
| `tailwind-merge` | ^3.6.0 | Merges/overrides conflicting Tailwind classes |
| `tailwindcss` + `@tailwindcss/postcss` | ^4 | Styling |
| `tw-animate-css` | ^1.4.0 | CSS keyframe animations (fade/zoom/slide) |
| `lucide-react` | ^1.31.0 | Icons |
| `recharts` | ^3.10.1 | Price charts on the stock detail page |
| `sonner` | ^2.0.8 | Toast notifications |
| `next-themes` | ^0.4.6 | Theme handling (installed; see Notes) |
| `shadcn` | ^4.17.0 | Component scaffolding CLI (used to generate `ui/*`) |
| `eslint` / `eslint-config-next` | ^9 / 16.3.0 | Linting |
| `typescript` / `@types/*` | ^5 / ^20 | Types |

> There is **no backend / database / ORM**. All data comes from mock modules in
> `src/data` and `localStorage`.

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No login is required; demo data is seeded
automatically on first visit.

Other scripts:

```bash
npm run lint    # eslint
npm run build   # production build (next build)
npm run start   # serve the production build (next start)
```

---

## Project Structure

```
src/
├── app/                       # Next.js App Router pages
│   ├── layout.tsx             # Root layout: StockProvider + Toaster
│   ├── page.tsx               # /  Dashboard
│   ├── alerts/page.tsx        # /alerts
│   ├── watchlist/page.tsx     # /watchlist
│   └── stocks/[symbol]/page.tsx  # /stocks/:symbol
├── components/
│   ├── ui/                    # shadcn-style primitives (Base UI based)
│   ├── layout/                # Sidebar, Navbar, NotificationDropdown
│   ├── dashboard/             # MarketOverview, RecentAlerts, StatsCard
│   ├── stocks/                # StockCard, StockList, StockDetail, StockChart, StockSearch, WatchlistButton
│   └── alerts/                # AlertList, AlertCard, CreateAlertDialog
├── context/
│   └── StockProvider.tsx      # Global state + price tick simulation + persistence
├── data/
│   ├── mockStocks.ts          # 10 seeded NSE stocks + seeded chart series
│   └── mockAlerts.ts          # 5 seeded alerts
├── lib/
│   ├── priceSimulator.ts      # Price movement + alert evaluation logic
│   ├── stockService.ts        # Mock stock service (future: REST API)
│   ├── alertService.ts        # Mock alert service + localStorage
│   ├── storage.ts             # localStorage helpers
│   ├── format.ts              # INR / percent / relative-time formatters
│   ├── sound.ts               # Bell sound synthesis (Web Audio API)
│   └── utils.ts               # cn() class helper
└── types/
    ├── stock.ts               # Stock, HistoricalPrice, PriceRange
    └── alert.ts               # Alert, Notification, AlertCondition, etc.
```

---

## Routes / Pages

| Route | Page | Content |
| --- | --- | --- |
| `/` | Dashboard | Greeting, 4 stat cards, Market Overview (watchlist), Recent Alerts, 10 Popular Stock cards, "About this preview" card |
| `/alerts` | Alerts | All / Active / Triggered tabs with counts, create-alert dialog, alert cards with enable/disable/delete |
| `/watchlist` | Watchlist | Stock search + table of watchlisted stocks (price, change, alerts count, view, remove) |
| `/stocks/[symbol]` | Stock Detail | Current price + change, 6 stat tiles, price chart with 1D/1W/1M/3M/1Y, watch button, create-alert button |

`/stocks/NOPE` (unknown symbol) shows a "Stock not found" screen with a link
back to the dashboard.

---

## Features & How They Work

### Live Price Simulation

There is no real market feed. Prices are simulated in the browser so the UI is
always moving and alerts can actually fire.

- `StockProvider.tsx` runs a `setInterval` every **5000 ms** (`TICK_INTERVAL_MS`).
- On each tick, every stock has a ~55% chance of moving
  (`Math.random() < 0.45` → stay flat).
- Movement is computed in `src/lib/priceSimulator.ts` → `simulatePriceMove()`:

  ```ts
  movement = (Math.random() - 0.45) * 2 * volatility  // volatility = 0.008
  ```

  Each move is roughly **−0.72% to +0.88%** (slightly upward-biased because of
  the `-0.45`). After a move, `change` / `changePercent` are recomputed against
  `previousClose`, `dayHigh`/`dayLow` are recalculated, and the `1D` and `1W`
  chart series each receive a new point.

- Chart history for all ranges is backfilled once at startup in
  `src/data/mockStocks.ts` using a seeded PRNG (`mulberry32`) via
  `generateSeries()`. Fixed seeds mean the charts look consistent until live
  ticks append new points.

Functions used: `simulatePriceMove`, `evaluateAlerts` (priceSimulator.ts),
`generateSeries`, `makeStock` (mockStocks.ts).

### Watchlist

- Add/remove stocks from the star button on any stock card, from the watchlist
  page, or the detail page.
- Persisted in `localStorage` (`stockalert:watchlist:v1`) and restored on load.
- Dashboard "Market Overview" and the "Watchlist Stocks" stat reflect the
  current watchlist.

Functions used: `addToWatchlist`, `removeFromWatchlist`, `isWatchlisted`
(StockProvider.tsx), `loadWatchlist`/`saveWatchlist` (stockService.ts).

### Stock Search

- Navbar + watchlist search open a popover; results come from
  `searchStocks(query)` in `src/lib/stockService.ts` (matches symbol or company
  name, top 8).
- Selecting a result routes to `/stocks/<symbol>`.

### Price Alerts

- Create via **CreateAlertDialog** (Alerts page or stock cards/detail page).
  Three condition types (`src/types/alert.ts`):
  - `ABOVE` — price crosses above a ₹ target
  - `BELOW` — price crosses below a ₹ target
  - `PERCENT_CHANGE` — price moves by a % vs previous close
- Validation in `CreateAlertDialog.handleSubmit`:
  - empty / non-numeric / ≤ 0 target → error
  - `ABOVE` target must be above the current price
  - `BELOW` target must be below the current price
- On every tick, `evaluateAlerts()` (priceSimulator.ts) checks each **ACTIVE**
  alert against the latest price. When a condition is met:
  1. the alert becomes `TRIGGERED` and stores `triggeredAt` + the price,
  2. a toast fires (sonner),
  3. a notification is added and the bell badge increases,
  4. a bell sound plays (see below).
- Cards let you **Disable** (stops evaluation), **Enable**, and **Delete**.

Functions used: `createAlert`, `withStatus`, `conditionLabel`, `loadAlerts`,
`saveAlerts` (alertService.ts), `evaluateAlerts`, `conditionMet`
(priceSimulator.ts).

### Notifications

- The bell icon in the navbar opens `NotificationDropdown`.
- Lists up to 50 notifications (newest first) with unread dots.
- "Mark all read" clears the unread badge; "Clear all" empties the list.
- Persisted in `localStorage` (`stockalert:notifications:v1`).
- Note: "Browser notification" / "Email" delivery is simulated (toast + in-app
  notification only) — no real OS notifications are sent.

### Alert Sound (Bell)

- Implemented in `src/lib/sound.ts` using the **Web Audio API** — no audio file
  is bundled.
- `playBell()` synthesizes a soft two-strike bell chime: an 880 Hz fundamental
  plus inharmonic partials (~2.7×, ~4.2×, ~5.1× the fundamental), each with an
  exponential decay envelope over ~1.6 s.
- It is called from `StockProvider.tsx` whenever one or more alerts trigger on a
  tick.
- **Autoplay policy**: browsers block sound before any user gesture. On mount,
  `StockProvider` attaches a one-time `pointerdown`/`keydown` listener that
  calls `initSound()` to create and resume the `AudioContext`. So after your
  first click anywhere, every trigger will ring the bell.
- If sound is disabled or the API is unavailable, `playBell` silently does
  nothing — it never breaks the alert flow.

### Charts

- `StockChart.tsx` renders an area chart with recharts for 5 ranges
  (1D/1W/1M/3M/1Y) sourced from `stock.historicalPrices`.
- Line color is green when the range trend is up, red when down.
- Live ticks extend the `1D` and `1W` series, so the chart updates while the
  page is open.

---

## Demo Data

10 NSE stocks (prices in ₹, approximate):

```
RELIANCE   TCS    INFY    HDFCBANK   ICICIBANK
SBIN       ITC    WIPRO   LT         BHARTIARTL
```

5 seeded alerts on first run:

| Stock | Condition | Target | Status |
| --- | --- | --- | --- |
| RELIANCE | ABOVE | 1500 | TRIGGERED |
| TCS | ABOVE | 3000 | ACTIVE |
| INFY | ABOVE | 1600 | ACTIVE |
| SBIN | BELOW | 830 | ACTIVE |
| HDFCBANK | ABOVE | 1700 | TRIGGERED |

---

## Persistence & Reset

Everything is stored in `localStorage`:

| Key | Contents |
| --- | --- |
| `stockalert:watchlist:v1` | Watchlist symbols |
| `stockalert:alerts:v1` | Alerts |
| `stockalert:notifications:v1` | Notifications |

To reset the demo data, run this in DevTools → Console and refresh:

```js
localStorage.removeItem("stockalert:alerts:v1");
localStorage.removeItem("stockalert:watchlist:v1");
localStorage.removeItem("stockalert:notifications:v1");
```

---

## Scripts

| Command | Action |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Notes

- The service layer (`stockService.ts`, `alertService.ts`) is written so a real
  backend can be swapped in later (documented `GET/POST /stocks`,
  `GET/POST /alerts`, `PATCH/DELETE /alerts/:id`) without changing the UI.
- `next-themes` is installed but a theme toggle is not wired up yet (the
  Settings menu shows "Theme (coming soon)").