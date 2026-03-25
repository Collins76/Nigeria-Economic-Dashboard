# Nigeria Economic Dashboard

Interactive web dashboard tracking Nigeria's key macroeconomic indicators — GDP, inflation, exchange rates, interest rates, trade, fiscal data, external sector, commodities, and financial markets.

## Features

- **KPI Row** — Top-level cards with sparklines, latest values, period change (absolute & %)
- **Interactive Time Series** — Line/area/bar charts with zoom, pan, tooltips, moving average overlay
- **Event Annotations** — Major policy events (subsidy removal, FX unification, MPR changes) plotted on charts
- **Comparison Mode** — Compare any two indicators side-by-side with optional normalization (index to 100)
- **Correlation Analysis** — Scatter plot with linear regression, R², and slope
- **Data Table** — Sortable, filterable table with raw data
- **Export** — Download charts as PNG, data as CSV or Excel
- **Threshold Alerts** — Set custom thresholds per KPI with visual flags
- **Narrative Summaries** — Auto-generated text summaries for each indicator
- **Themes** — Light, Dark, and High Contrast modes
- **Accessibility** — Keyboard navigation, skip links, ARIA labels, screen-reader friendly
- **Responsive** — Desktop, tablet, and mobile layouts

## Indicators Covered (27)

| Category | Indicators |
|----------|-----------|
| GDP | Nominal GDP, Real GDP Growth, GDP Per Capita |
| Inflation | Headline CPI, Core Inflation, Food Inflation |
| Labour | Unemployment Rate |
| Exchange Rates | USD/NGN (official), Parallel rate, EUR/NGN, GBP/NGN |
| Interest Rates | MPR, 91-Day T-Bill, 364-Day T-Bill |
| Trade | Exports, Imports, Trade Balance |
| Fiscal | Government Revenue, Government Expenditure |
| External | Foreign Reserves, External Debt, Current Account |
| Commodity | Oil Production, Bonny Light Price |
| Financial Markets | NGX All-Share Index, NGX Market Cap |
| Leading Indicators | PMI |

## Quick Start

### Option 1: Open directly (no build required)
```bash
# Just open index.html in any browser
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

### Option 2: Serve locally
```bash
# Python
python -m http.server 8000 --directory .
# Then open http://localhost:8000

# Node.js (if available)
npx serve .
```

### Option 3: Docker
```bash
docker build -t nigeria-dashboard .
docker run -p 8080:80 nigeria-dashboard
# Open http://localhost:8080
```

## ETL Pipeline

The ETL pipeline fetches data from authoritative sources and stores time-series as JSON.

```bash
cd etl
pip install -r requirements.txt

# Fetch all indicators from World Bank API
python pipeline.py --all

# Run scheduled updates
python pipeline.py --schedule

# Validate data integrity
python pipeline.py --validate

# Export for dashboard
python pipeline.py --export
```

### Data Sources

| Source | Indicators | Method |
|--------|-----------|--------|
| World Bank API | GDP, inflation, trade, external | REST API |
| CBN | FX rates, MPR, reserves, T-bills | Web scrape |
| NBS | CPI breakdown, GDP detail, labour | PDF download |
| NGX | Stock index, market cap | Web scrape |
| OPEC | Oil production, pricing | Publication |

### Update Schedule

- **Daily (08:00 WAT)**: Exchange rates, oil price, stock index
- **Monthly (15th)**: CPI, reserves, oil production, MPR, T-bills, PMI
- **Quarterly**: GDP, trade, fiscal, external debt, current account
- **Annual**: GDP per capita

## Project Structure

```
nigeria-economic-dashboard/
├── index.html              # Main dashboard (self-contained)
├── Dockerfile              # Docker deployment config
├── docker-compose.yml      # Docker Compose config
├── data/
│   ├── indicators.json     # Indicator metadata and events
│   └── ts_*.json           # Time series data files (from ETL)
├── etl/
│   ├── pipeline.py         # ETL pipeline script
│   ├── schedule.yaml       # Source mapping and update schedule
│   └── requirements.txt    # Python dependencies
├── docs/
│   ├── data-sources.md     # Data source documentation
│   ├── schema.md           # Data schema reference
│   ├── runbook.md          # Operations runbook
│   └── api-spec.yaml       # OpenAPI spec for data API
└── logs/
    └── etl.log             # ETL execution logs
```

## Schema

### Indicator Metadata
```json
{
  "id": "cpi_headline",
  "name": "Headline Inflation (CPI)",
  "category": "Inflation",
  "frequency": "monthly",
  "units": "% YoY",
  "source": "NBS",
  "source_url": "https://nigerianstat.gov.ng"
}
```

### Time Series Record
```json
{
  "date": "2024-01-31",
  "value": 29.9,
  "source_url": "https://api.worldbank.org/..."
}
```

## Browser Support

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS Safari 14+, Chrome Android 90+

## Technology

- **Frontend**: Vanilla HTML/CSS/JS (zero build step)
- **Charts**: Chart.js 4.x with zoom, annotation plugins
- **Export**: PapaParse (CSV), SheetJS (Excel), html2canvas (PNG)
- **ETL**: Python 3.10+ with requests, pandas, schedule
- **Deployment**: Docker / Nginx / any static host

## License

MIT
