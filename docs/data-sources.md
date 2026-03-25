# Data Sources Manifest

## Primary Sources

### 1. National Bureau of Statistics (NBS)
- **URL**: https://nigerianstat.gov.ng
- **Indicators**: GDP (nominal, real growth), CPI (headline, core, food), unemployment, trade, fiscal
- **Format**: PDF reports, Excel tables
- **Update**: Monthly CPI report (~15th), Quarterly GDP report (~Q+60 days)
- **Access**: Free, no API key required
- **Notes**: Primary authority for national statistics. Reports published as PDF; values extracted manually or via parsing.

### 2. Central Bank of Nigeria (CBN)
- **URL**: https://www.cbn.gov.ng
- **Indicators**: Exchange rates (all windows), MPR, T-bill rates, foreign reserves, balance of payments
- **Format**: HTML tables, PDF statistical bulletin
- **Update**: Daily (FX), after each MPC meeting (MPR), Monthly (reserves)
- **Access**: Free
- **Notes**: Official FX rates. MPC meets every 2 months. Statistical Bulletin contains historical series.

### 3. World Bank Open Data API
- **URL**: https://api.worldbank.org/v2
- **Indicators**: GDP, inflation, trade, external debt, reserves, unemployment (annual)
- **Format**: JSON/XML REST API
- **Update**: Annual (with ~6-12 month lag)
- **Access**: Free, no API key needed
- **Rate Limit**: ~30 requests/minute
- **Notes**: Best for long-run annual series and cross-country comparison. Not suitable for high-frequency data.

### 4. IMF Data
- **URL**: https://data.imf.org
- **Indicators**: GDP, fiscal, external sector, inflation
- **Format**: JSON API (SDMX), Excel
- **Update**: Quarterly/Annual
- **Access**: Free
- **Notes**: World Economic Outlook and International Financial Statistics databases.

## Secondary / Fallback Sources

### 5. OPEC
- **URL**: https://www.opec.org
- **Indicators**: Oil production, basket price
- **Format**: Monthly Oil Market Report (PDF), web
- **Update**: Monthly
- **Access**: Free

### 6. NNPC (Nigerian National Petroleum Company)
- **URL**: https://www.nnpcgroup.com
- **Indicators**: Domestic oil production, refinery throughput
- **Format**: Monthly reports (PDF)
- **Update**: Monthly

### 7. NGX Group (Nigerian Exchange)
- **URL**: https://ngxgroup.com
- **Indicators**: All-Share Index, market capitalization, sector indices
- **Format**: Web data, daily market reports
- **Update**: Daily (trading days)
- **Access**: Basic data free, historical may require subscription

### 8. FMDQ Securities Exchange
- **URL**: https://fmdqgroup.com
- **Indicators**: T-bill yields, FX (I&E window), bond yields
- **Format**: Web, daily reports
- **Update**: Daily

### 9. Debt Management Office (DMO)
- **URL**: https://www.dmo.gov.ng
- **Indicators**: External debt stock, domestic debt, debt-to-GDP ratio
- **Format**: Quarterly reports, Excel
- **Update**: Quarterly

### 10. Stanbic IBTC / S&P Global
- **Indicators**: Nigeria PMI
- **Format**: Monthly press release
- **Update**: Monthly (~1st business day)
- **Access**: Summary free, full data may require subscription

## Cross-Validation Strategy

For each indicator, cross-check between:
1. **Primary source** (NBS, CBN) — authoritative
2. **World Bank / IMF** — validated, standardized
3. **Market sources** — real-time but less official

Flag discrepancies > 2% for manual review.

## API Key Requirements

| Source | Key Required | How to Obtain |
|--------|-------------|---------------|
| World Bank | No | — |
| IMF | No | — |
| CBN | No | — |
| NBS | No | — |
| Trading Economics | Yes (paid) | https://tradingeconomics.com/api |
| NGX | No (basic) | — |
| FRED | Yes (free) | https://fred.stlouisfed.org/docs/api |
