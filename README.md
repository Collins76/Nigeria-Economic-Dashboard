# Nigeria Economic Dashboard

An interactive, production-ready dashboard for visualizing Nigeria's key macroeconomic and market indicators.

## Features

- **KPI Dashboard**: 8 primary indicators with sparklines and delta values
- **Time Series Charts**: Interactive charts with zoom, pan, and tooltips
- **Correlation Analysis**: Scatter plots with regression analysis
- **Sector Breakdown**: GDP and trade composition charts
- **Data Table**: Sortable, filterable data with CSV export
- **Economic Events Timeline**: Historical policy events
- **Alert System**: Configurable threshold alerts
- **Dark/Light Mode**: Theme toggle
- **Responsive Design**: Works on desktop, tablet, and mobile

## Indicators Included

| Category | Indicators |
|----------|------------|
| **GDP** | Nominal GDP, Growth Rate, Per Capita |
| **Inflation** | Headline CPI, Food Inflation, Core Inflation |
| **Labour** | Unemployment Rate |
| **Exchange Rates** | NGN/USD (Official), Parallel Market |
| **Interest Rates** | MPR, 91-Day T-Bill |
| **Trade** | Exports, Imports, Trade Balance |
| **Fiscal** | Government Revenue, Expenditure, Budget Balance |
| **External** | FX Reserves, External Debt |
| **Commodities** | Oil Production, Brent Crude Price |
| **Financial Markets** | NGX All-Share Index, Market Cap |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React

## Deployment

Build the project and deploy the `dist/` folder to any static hosting:

```bash
npm run build
# Deploy dist/ to Netlify, Vercel, S3, etc.
```

## Documentation

See [SPEC.md](./SPEC.md) for detailed specification.

## License

MIT
