# Data Schema Reference

## Indicator Metadata (indicators.json)

```
indicators[]
├── id          string    Unique identifier (snake_case)
├── name        string    Human-readable display name
├── category    string    Grouping category
├── frequency   enum      "daily" | "monthly" | "quarterly" | "annual"
├── units       string    Display units (e.g., "% YoY", "NGN Trillion")
├── description string    Full description of the indicator
├── source      string    Primary data source name
└── source_url  string    URL to source

events[]
├── date        string    ISO date (YYYY-MM-DD)
├── title       string    Short event title
├── description string    Event description
└── tags[]      string    Category tags for filtering
```

## Time Series Data (ts_*.json)

Each indicator has a separate JSON file: `ts_{indicator_id}.json`

```
[
  {
    "date":       "2024-01-31",    // ISO date
    "value":      29.9,            // Numeric value
    "source_url": "https://..."    // Provenance URL
  }
]
```

## Dashboard Internal Format (DATA.series)

```
{
  "{indicator_id}": {
    "dates":  ["2015-01-01", ...],   // ISO date strings
    "values": [9.6, ...]             // Corresponding numeric values
  }
}
```

## Provenance Log (provenance.jsonl)

One JSON object per line:

```
{
  "timestamp":  "2026-03-25T10:00:00Z",
  "indicator":  "cpi_headline",
  "source":     "WorldBank",
  "url":        "https://api.worldbank.org/...",
  "records":    25,
  "status":     "success"
}
```

## Database Schema (for PostgreSQL deployment)

```sql
CREATE TABLE indicators (
    id              VARCHAR(50) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    category        VARCHAR(50) NOT NULL,
    frequency       VARCHAR(20) NOT NULL CHECK (frequency IN ('daily','monthly','quarterly','annual')),
    units           VARCHAR(50) NOT NULL,
    description     TEXT,
    source          VARCHAR(100),
    source_url      VARCHAR(500),
    update_cron     VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE timeseries (
    id              BIGSERIAL PRIMARY KEY,
    indicator_id    VARCHAR(50) NOT NULL REFERENCES indicators(id),
    date            DATE NOT NULL,
    value           DOUBLE PRECISION,
    source_url      VARCHAR(500),
    fetched_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(indicator_id, date)
);

CREATE INDEX idx_timeseries_indicator_date ON timeseries(indicator_id, date DESC);
CREATE INDEX idx_timeseries_date ON timeseries(date);

CREATE TABLE events (
    id              SERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    tags            TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);

CREATE TABLE provenance (
    id              BIGSERIAL PRIMARY KEY,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    indicator_id    VARCHAR(50) REFERENCES indicators(id),
    source          VARCHAR(100),
    url             VARCHAR(500),
    records_fetched INTEGER,
    status          VARCHAR(50),
    error_message   TEXT
);
```

## Indicator ID Reference

| ID | Name | Category | Frequency | Units |
|----|------|----------|-----------|-------|
| gdp_nominal | Nominal GDP | GDP | quarterly | NGN Trillion |
| gdp_real_growth | Real GDP Growth | GDP | quarterly | % |
| gdp_per_capita | GDP Per Capita | GDP | annual | USD |
| cpi_headline | Headline CPI | Inflation | monthly | % YoY |
| cpi_core | Core Inflation | Inflation | monthly | % YoY |
| cpi_food | Food Inflation | Inflation | monthly | % YoY |
| unemployment_rate | Unemployment Rate | Labour | quarterly | % |
| fx_usd_ngn | USD/NGN Rate | Exchange Rates | daily | NGN/USD |
| fx_parallel | Parallel Rate | Exchange Rates | daily | NGN/USD |
| fx_eur_ngn | EUR/NGN Rate | Exchange Rates | daily | NGN/EUR |
| fx_gbp_ngn | GBP/NGN Rate | Exchange Rates | daily | NGN/GBP |
| mpr | Monetary Policy Rate | Interest Rates | monthly | % |
| tbill_91 | 91-Day T-Bill | Interest Rates | monthly | % |
| tbill_364 | 364-Day T-Bill | Interest Rates | monthly | % |
| exports | Total Exports | Trade | quarterly | NGN Billion |
| imports | Total Imports | Trade | quarterly | NGN Billion |
| trade_balance | Trade Balance | Trade | quarterly | NGN Billion |
| govt_revenue | Government Revenue | Fiscal | quarterly | NGN Billion |
| govt_expenditure | Government Expenditure | Fiscal | quarterly | NGN Billion |
| foreign_reserves | Foreign Reserves | External | monthly | USD Billion |
| external_debt | External Debt | External | quarterly | USD Billion |
| current_account | Current Account | External | quarterly | USD Billion |
| oil_production | Crude Oil Production | Commodity | monthly | Million bpd |
| oil_price | Bonny Light Price | Commodity | daily | USD/barrel |
| ngx_asi | NGX All-Share Index | Financial Markets | daily | Points |
| ngx_market_cap | NGX Market Cap | Financial Markets | daily | NGN Trillion |
| pmi | PMI | Leading Indicators | monthly | Index |
