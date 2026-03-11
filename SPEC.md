# Nigeria Economic Dashboard - Specification Document

## Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | Nigeria Economic Dashboard |
| **Project Type** | Interactive Data Visualization Web Application |
| **Core Functionality** | Real-time visualization of Nigeria's macroeconomic and market indicators with filtering, drilldowns, correlation analysis, and data export capabilities |
| **Target Users** | Policymakers, economists, researchers, journalists, and general public |

---

## Technical Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: React useState/useCallback hooks
- **Build Output**: Static bundle (dist/)

---

## UI/UX Specification

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo | Dashboard Title | Dark Toggle | Last Update│
├─────────────────────────────────────────────────────────────┤
│ KPI ROW (8 cards): GDP Growth | Inflation | FX USD | MPR   │
│                   | Reserves | Oil Price | NGX | Unemployment
├─────────────────────────────────────────────────────────────┤
│ TAB BAR: Overview | Time Series | Correlation | Sectors   │
│         | Data Table | Events | Alerts                     
├─────────────────────────────────────────────────────────────┤
│ MAIN CONTENT AREA                                          │
│ - Filter Bar (Date Range, Frequency, Indicators)            │
│ - Charts / Tables / Drilldowns                             │
├─────────────────────────────────────────────────────────────┤
│ FOOTER: Source Attribution | Version | Export Buttons      │
└─────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

| Breakpoint | Width | Grid Columns (KPI) |
|------------|-------|-------------------|
| Mobile | < 640px | 2 columns |
| Tablet | 640px - 1024px | 4 columns |
| Desktop | > 1024px | 8 columns |

### Color Palette

| Role | Color | Hex Code |
|------|-------|----------|
| Primary (Nigeria Green) | Emerald | `#10b981` |
| Secondary (Brand) | Deep Blue | `#1e40af` |
| Danger (High Inflation) | Red | `#ef4444` |
| Warning | Amber | `#f59e0b` |
| Success | Green | `#22c55e` |
| Neutral Dark | Slate 900 | `#0f172a` |
| Neutral Light | Slate 50 | `#f8fafc` |
| Background (Dark) | Slate 950 | `#020617` |
| Background (Light) | Slate 50 | `#f8fafc` |

### Typography

- **Font Family**: Inter (system fallback: -apple-system, BlinkMacSystemFont, Segoe UI)
- **Headings**: 
  - H1: 24px / 700 weight
  - H2: 20px / 600 weight
  - H3: 16px / 600 weight
- **Body**: 14px / 400 weight
- **Caption**: 12px / 400 weight

### Spacing System

- Base unit: 4px
- Common spacings: 4, 8, 12, 16, 20, 24, 32, 40, 48px

### Components

#### 1. KPICard
- Displays indicator name, current value, delta vs previous period
- Sparkline visualization (last 12 data points)
- Click to open drilldown
- Color-coded based on positive/negative direction
- Alert badges when thresholds exceeded

#### 2. TimeSeriesChart
- Interactive line/area chart using Recharts
- Zoom and pan support via recharts brush
- Tooltip showing exact value and % change
- Toggle for moving average overlay
- Event annotations on timeline
- Export as PNG/SVG

#### 3. FilterBar
- Date range selector with presets (1Y, 3Y, 5Y, 10Y, All)
- Frequency toggle (Daily/Weekly/Monthly/Quarterly/Annual)
- Indicator multi-select dropdown
- Compare mode toggle

#### 4. DataTable
- Sortable columns (Date, Indicator, Value, Change)
- Pagination (50 rows per page)
- Download as CSV button
- Filter input

#### 5. DrilldownPanel
- Modal overlay with detailed view
- Full historical chart
- Breakdown by sub-category (e.g., GDP by sector)
- Raw data table
- Narrative summary

#### 6. CorrelationMatrix
- Scatter plot grid for selected indicators
- Regression line with R² value
- Configurable indicator pairs

#### 7. AlertsPanel
- List of configured thresholds
- Add/remove alert controls
- Visual indicators for triggered alerts

#### 8. EventsTimeline
- Vertical timeline of economic events
- Filterable by category
- Click to highlight on charts

---

## Data Specification

### Indicators Included (23 Total)

| ID | Name | Category | Unit | Frequency | Source |
|----|------|----------|------|-----------|--------|
| gdp_nominal | GDP (Nominal) | GDP | ₦ Trillion | Quarterly | NBS Nigeria |
| gdp_growth | GDP Growth Rate | GDP | % YoY | Quarterly | NBS Nigeria |
| gdp_per_capita | GDP Per Capita | GDP | USD | Annual | World Bank |
| inflation_headline | Headline Inflation (CPI) | Inflation | % YoY | Monthly | NBS Nigeria |
| inflation_food | Food Inflation | Inflation | % YoY | Monthly | NBS Nigeria |
| inflation_core | Core Inflation | Inflation | % YoY | Monthly | NBS Nigeria |
| unemployment | Unemployment Rate | Labour | % | Quarterly | NBS Nigeria |
| fx_usd | NGN/USD Exchange Rate | Exchange Rate | ₦ per $ | Monthly | CBN Nigeria |
| fx_parallel | Parallel Market Rate | Exchange Rate | ₦ per $ | Monthly | Market |
| mpr | Monetary Policy Rate (MPR) | Interest Rates | % | Monthly | CBN Nigeria |
| t_bill_91 | 91-Day Treasury Bill Rate | Interest Rates | % | Monthly | DMO |
| exports | Total Exports | Trade | $ Billion | Quarterly | NBS Nigeria |
| imports | Total Imports | Trade | $ Billion | Quarterly | NBS Nigeria |
| trade_balance | Trade Balance | Trade | $ Billion | Quarterly | NBS Nigeria |
| govt_revenue | Government Revenue | Fiscal | ₦ Trillion | Quarterly | CBN/OAGF |
| govt_expenditure | Government Expenditure | Fiscal | ₦ Trillion | Quarterly | CBN/OAGF |
| budget_balance | Budget Balance | Fiscal | ₦ Trillion | Annual | Budget Office |
| fx_reserves | Foreign Exchange Reserves | External | $ Billion | Monthly | CBN Nigeria |
| external_debt | External Debt | External | $ Billion | Quarterly | DMO |
| oil_production | Crude Oil Production | Commodities | mbpd | Monthly | NNPC/OPEC |
| oil_price | Brent Crude Price | Commodities | $/bbl | Monthly | EIA/ICE |
| ngx_index | NGX All-Share Index | Financial Markets | Points | Monthly | NGX |
| market_cap | NGX Market Capitalisation | Financial Markets | ₦ Trillion | Monthly | NGX |

### Data Schema (TypeScript)

```typescript
interface Indicator {
  id: string;
  name: string;
  shortName: string;
  category: string;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  source: string;
  sourceUrl: string;
  description: string;
  positiveDirection: 'up' | 'down' | 'neutral';
  lastUpdated: string;
  updateCadence: string;
  color: string;
}

interface DataPoint {
  date: string;
  value: number;
}

interface EconomicEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'monetary' | 'fiscal' | 'external' | ' commodity' | 'political';
}
```

---

## Functionality Specification

### Core Features

1. **KPI Dashboard**
   - 8 primary KPIs displayed in responsive grid
   - Real-time value, delta % vs previous period
   - Mini sparkline charts
   - Click for drilldown

2. **Time Series Visualization**
   - Interactive line charts with zoom/pan
   - Date range filtering (preset + custom)
   - Frequency aggregation toggle
   - Moving average overlay option
   - Event annotations
   - Export as PNG/SVG

3. **Multi-Indicator Comparison**
   - Select up to 4 indicators for overlay
   - Normalized comparison mode
   - Different y-axis scaling options

4. **Correlation Analysis**
   - Scatter plot matrix
   - Regression fit line
   - R² coefficient display

5. **Sector Breakdown**
   - Stacked bar charts
   - GDP by sector (Agriculture, Industry, Services)
   - Trade by commodity type

6. **Data Table**
   - Full time series data
   - Sortable, filterable
   - CSV download with metadata

7. **Economic Events Timeline**
   - Historical policy events
   - Filterable by category
   - Click to see on chart

8. **Alert System**
   - User-configurable thresholds
   - Visual indicators on KPI cards
   - Alert management panel

9. **Dark Mode**
   - Toggle between light/dark themes
   - Persistent preference

10. **Data Export**
    - Download charts as PNG/SVG
    - Download raw data as CSV

### User Interactions

| Action | Result |
|--------|--------|
| Click KPI Card | Opens drilldown modal |
| Hover Chart | Shows tooltip with value/date |
| Drag on Chart | Zoom to selection |
| Click Date Preset | Filters to date range |
| Toggle Frequency | Aggregates data |
| Toggle Compare | Adds comparison indicators |
| Click Export | Downloads chart/data |
| Toggle Dark Mode | Switches theme |

---

## Acceptance Criteria

### Functional Criteria

- [x] All 23 indicators display correctly
- [x] KPI cards show sparklines and delta values
- [x] Time series charts are interactive (zoom, hover, pan)
- [x] Date range filter works correctly
- [x] Frequency toggle aggregates data appropriately
- [x] Drilldown modal opens with detailed view
- [x] Correlation scatter plots render with regression
- [x] Data table is sortable and filterable
- [x] CSV download produces valid file
- [x] Dark/light mode toggle works
- [x] Responsive layout works on all breakpoints
- [x] Alert thresholds display correctly

### Performance Criteria

- Initial load < 2 seconds
- Chart interactions smooth (60fps)
- No memory leaks on navigation

### Accessibility Criteria

- Keyboard navigation works
- ARIA labels present
- Color contrast meets WCAG AA

---

## Data Sources

| Source | Indicators | Update Frequency |
|--------|------------|------------------|
| NBS Nigeria | GDP, Inflation, Labour, Trade | Monthly/Quarterly |
| CBN Nigeria | FX, Reserves, MPR, T-Bills | Daily/Weekly |
| World Bank | GDP Per Capita | Annual |
| DMO Nigeria | External Debt, T-Bills | Quarterly |
| NNPC/OPEC | Oil Production | Monthly |
| EIA/ICE | Oil Price | Daily |
| NGX | Stock Index, Market Cap | Daily |

---

## Project Structure

```
nigeria-economic-dashboard/
├── src/
│   ├── components/
│   │   ├── AlertsPanel.tsx
│   │   ├── CorrelationMatrix.tsx
│   │   ├── DataTable.tsx
│   │   ├── DrilldownPanel.tsx
│   │   ├── EventsTimeline.tsx
│   │   ├── FilterBar.tsx
│   │   ├── Header.tsx
│   │   ├── IndicatorSelector.tsx
│   │   ├── KPICard.tsx
│   │   ├── SectorChart.tsx
│   │   └── TimeSeriesChart.tsx
│   ├── data/
│   │   ├── events.ts
│   │   ├── indicators.ts
│   │   ├── narratives.ts
│   │   ├── timeseries.ts
│   │   └── types.ts
│   ├── store/
│   │   └── dashboardStore.ts
│   ├── utils/
│   │   ├── dataHelpers.ts
│   │   └── format.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── dist/                  # Build output
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Output in `dist/` folder - can be deployed to any static host (Netlify, Vercel, GitHub Pages, S3, etc.)

### Development

```bash
npm run dev
```

---

## Future Enhancements (Roadmap)

### Phase 2
- Real API integration (NBS, CBN, World Bank)
- Backend with PostgreSQL + ETL pipeline
- User authentication
- Automated data refresh scheduling

### Phase 3
- Forecasting module (ARIMA/Prophet)
- PDF report generation
- Subnational data (state-level)
- Mobile app

---

*Last Updated: March 2026*
