# 💰 Wealth Tracker & Budget Hub

A comprehensive iOS-friendly mobile web app for tracking personal net worth and managing monthly budgets. All data is stored locally in the browser — no accounts, no cloud, fully private.

## Features

- **9-screen onboarding** with currency selection and optional example data
- **Wealth Tracker** — savings, stocks, and retirement accounts with YTD/1Y/5Y growth metrics, line chart, and donut chart
- **Budget Tracker** — 27th–26th monthly cycles, Needs/Wants/Save & Invest buckets, expense logging, monthly comparison chart
- **Dashboard** — net worth hero card, budget progress, quick actions
- **Settings** — change currency (20 supported), export data as JSON, clear all data
- **Multi-currency support** — MYR, USD, SGD, EUR, GBP, and 15 more

## Tech Stack

- React 19 + Vite
- Recharts for data visualizations
- localStorage for all data persistence (no backend)

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Data Storage

All data is stored in `localStorage` under these keys:

| Key | Contents |
|-----|----------|
| `wealthData` | Array of wealth entries (savings, stocks, retirement) |
| `budgetHistory` | Array of monthly budget cycles |
| `appSettings` | Currency and display preferences |
| `onboardingComplete` | Boolean — skips onboarding on revisit |
| `exampleDataCleared` | Boolean — tracks whether demo data was cleared |
