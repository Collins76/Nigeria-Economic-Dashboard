"""
Nigeria Economic Dashboard — ETL Pipeline
==========================================
Fetches macroeconomic data from authoritative sources and stores
canonical time-series in JSON (or optionally PostgreSQL).

Sources:
  - World Bank API (GDP, inflation, trade, external indicators)
  - CBN website / published data (FX, MPR, reserves)
  - OPEC / market feeds (oil prices)
  - NGX / market data (stock index)

Usage:
  python pipeline.py --all              # Fetch all indicators
  python pipeline.py --indicator gdp    # Fetch specific category
  python pipeline.py --schedule         # Run scheduled updates
  python pipeline.py --validate         # Validate data integrity

Requirements:
  pip install requests pandas schedule python-dateutil
"""

import argparse
import json
import logging
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

try:
    import pandas as pd
except ImportError:
    pd = None
    print("Warning: pandas not installed. Some features limited. pip install pandas")

# ── Configuration ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
LOG_DIR = BASE_DIR / "logs"
DATA_DIR.mkdir(exist_ok=True)
LOG_DIR.mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_DIR / "etl.log"),
    ],
)
log = logging.getLogger("etl")

# World Bank API base
WB_API = "https://api.worldbank.org/v2/country/NGA/indicator"
WB_INDICATORS = {
    "gdp_nominal": "NY.GDP.MKTP.CN",         # GDP current LCU
    "gdp_real_growth": "NY.GDP.MKTP.KD.ZG",  # GDP growth annual %
    "gdp_per_capita": "NY.GDP.PCAP.CD",       # GDP per capita USD
    "cpi_headline": "FP.CPI.TOTL.ZG",        # Inflation, consumer prices
    "unemployment_rate": "SL.UEM.TOTL.ZS",   # Unemployment %
    "exports": "NE.EXP.GNFS.CN",             # Exports of goods and services LCU
    "imports": "NE.IMP.GNFS.CN",             # Imports LCU
    "trade_balance": "NE.RSB.GNFS.CN",       # External balance on goods
    "external_debt": "DT.DOD.DECT.CD",       # External debt stocks
    "current_account": "BN.CAB.XOKA.CD",     # Current account balance
    "foreign_reserves": "FI.RES.TOTL.CD",    # Total reserves
    "oil_production": "EP.PMP.SGAS.CD",       # Pump price (proxy)
}

# ── Provenance Tracking ───────────────────────────────────────
def log_provenance(indicator_id, source, url, records_fetched, status):
    """Log data fetch provenance for audit."""
    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "indicator": indicator_id,
        "source": source,
        "url": url,
        "records": records_fetched,
        "status": status,
    }
    prov_file = DATA_DIR / "provenance.jsonl"
    with open(prov_file, "a") as f:
        f.write(json.dumps(entry) + "\n")
    log.info(f"Provenance logged: {indicator_id} — {status} ({records_fetched} records)")


# ── World Bank Fetcher ────────────────────────────────────────
def fetch_world_bank(indicator_id, wb_code, start_year=2000, end_year=2025):
    """Fetch annual data from World Bank API."""
    url = f"{WB_API}/{wb_code}?format=json&date={start_year}:{end_year}&per_page=100"
    log.info(f"Fetching {indicator_id} from World Bank: {wb_code}")

    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        data = resp.json()

        if len(data) < 2 or not data[1]:
            log.warning(f"No data returned for {indicator_id}")
            log_provenance(indicator_id, "WorldBank", url, 0, "empty")
            return []

        records = []
        for entry in data[1]:
            if entry.get("value") is not None:
                records.append({
                    "date": f"{entry['date']}-12-31",
                    "value": float(entry["value"]),
                    "source_url": url,
                })

        records.sort(key=lambda r: r["date"])
        log_provenance(indicator_id, "WorldBank", url, len(records), "success")
        log.info(f"  → {len(records)} records for {indicator_id}")
        return records

    except requests.RequestException as e:
        log.error(f"Failed to fetch {indicator_id}: {e}")
        log_provenance(indicator_id, "WorldBank", url, 0, f"error: {e}")
        return []


# ── CBN Data Fetcher (placeholder for scraping/API) ──────────
def fetch_cbn_rates():
    """
    Placeholder for CBN exchange rate data.
    In production, this would scrape https://www.cbn.gov.ng/rates/ExchRateByCurrency.asp
    or use their data portal.
    """
    log.info("CBN data fetch — placeholder (requires web scraping in production)")
    log_provenance("fx_usd_ngn", "CBN", "https://www.cbn.gov.ng", 0, "placeholder")
    return []


def fetch_cbn_mpr():
    """
    Placeholder for CBN Monetary Policy Rate history.
    Source: https://www.cbn.gov.ng/rates/mnymktind.asp
    """
    log.info("CBN MPR fetch — placeholder")
    log_provenance("mpr", "CBN", "https://www.cbn.gov.ng", 0, "placeholder")
    return []


# ── Market Data Fetchers ──────────────────────────────────────
def fetch_oil_price():
    """
    Placeholder for oil price data.
    In production, use OPEC API, EIA, or a market data provider.
    """
    log.info("Oil price fetch — placeholder")
    log_provenance("oil_price", "OPEC", "", 0, "placeholder")
    return []


def fetch_ngx_index():
    """
    Placeholder for NGX All-Share Index.
    In production, scrape NGX website or use data vendor API.
    """
    log.info("NGX index fetch — placeholder")
    log_provenance("ngx_asi", "NGX", "https://ngxgroup.com", 0, "placeholder")
    return []


# ── Data Storage ──────────────────────────────────────────────
def save_timeseries(indicator_id, records):
    """Save time-series data to JSON file."""
    if not records:
        return

    filepath = DATA_DIR / f"ts_{indicator_id}.json"

    # Merge with existing data (incremental update)
    existing = []
    if filepath.exists():
        with open(filepath) as f:
            existing = json.load(f)

    # Deduplicate by date
    date_map = {r["date"]: r for r in existing}
    for r in records:
        date_map[r["date"]] = r

    merged = sorted(date_map.values(), key=lambda r: r["date"])

    with open(filepath, "w") as f:
        json.dump(merged, f, indent=2)

    log.info(f"Saved {len(merged)} records to {filepath.name}")


def save_snapshot():
    """Save a snapshot of all current data with timestamp for reproducibility."""
    snapshot_dir = DATA_DIR / "snapshots"
    snapshot_dir.mkdir(exist_ok=True)

    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    snapshot = {}

    for f in DATA_DIR.glob("ts_*.json"):
        indicator_id = f.stem.replace("ts_", "")
        with open(f) as fh:
            snapshot[indicator_id] = json.load(fh)

    snapshot_file = snapshot_dir / f"snapshot_{timestamp}.json"
    with open(snapshot_file, "w") as f:
        json.dump(snapshot, f)

    log.info(f"Snapshot saved: {snapshot_file.name}")


# ── Validation ────────────────────────────────────────────────
def validate_data():
    """Run validation checks on stored data."""
    log.info("Running data validation...")
    issues = []

    for f in sorted(DATA_DIR.glob("ts_*.json")):
        indicator_id = f.stem.replace("ts_", "")
        with open(f) as fh:
            records = json.load(fh)

        if not records:
            issues.append(f"{indicator_id}: empty dataset")
            continue

        # Check for nulls
        null_count = sum(1 for r in records if r.get("value") is None)
        if null_count:
            issues.append(f"{indicator_id}: {null_count} null values")

        # Check date ordering
        dates = [r["date"] for r in records]
        if dates != sorted(dates):
            issues.append(f"{indicator_id}: dates not sorted")

        # Check for duplicates
        if len(dates) != len(set(dates)):
            issues.append(f"{indicator_id}: duplicate dates found")

        # Check for extreme outliers (> 5 std dev from mean)
        values = [r["value"] for r in records if r.get("value") is not None]
        if len(values) > 10:
            mean = sum(values) / len(values)
            std = (sum((v - mean) ** 2 for v in values) / len(values)) ** 0.5
            if std > 0:
                outliers = sum(1 for v in values if abs(v - mean) > 5 * std)
                if outliers:
                    issues.append(f"{indicator_id}: {outliers} extreme outliers (>5σ)")

        log.info(f"  ✓ {indicator_id}: {len(records)} records, range [{dates[0]} → {dates[-1]}]")

    if issues:
        log.warning(f"Validation issues found:")
        for issue in issues:
            log.warning(f"  ⚠ {issue}")
    else:
        log.info("All validations passed ✓")

    return issues


# ── Fetch All ─────────────────────────────────────────────────
def fetch_all():
    """Fetch all available indicators."""
    log.info("=" * 60)
    log.info("Starting full data fetch")
    log.info("=" * 60)

    # World Bank indicators
    for ind_id, wb_code in WB_INDICATORS.items():
        records = fetch_world_bank(ind_id, wb_code)
        save_timeseries(ind_id, records)
        time.sleep(0.5)  # Rate limiting

    # CBN data
    fetch_cbn_rates()
    fetch_cbn_mpr()

    # Market data
    fetch_oil_price()
    fetch_ngx_index()

    # Save snapshot
    save_snapshot()

    log.info("Full fetch complete")


def fetch_daily():
    """Fetch daily-frequency indicators only (FX, oil, stock index)."""
    log.info("Running daily fetch...")
    fetch_cbn_rates()
    fetch_oil_price()
    fetch_ngx_index()
    log.info("Daily fetch complete")


def fetch_monthly():
    """Fetch monthly-frequency indicators (CPI, reserves, production)."""
    log.info("Running monthly fetch...")
    for ind_id in ["cpi_headline", "foreign_reserves", "oil_production"]:
        if ind_id in WB_INDICATORS:
            records = fetch_world_bank(ind_id, WB_INDICATORS[ind_id])
            save_timeseries(ind_id, records)
            time.sleep(0.5)
    log.info("Monthly fetch complete")


# ── Scheduler ─────────────────────────────────────────────────
def run_scheduler():
    """Run scheduled data updates."""
    try:
        import schedule
    except ImportError:
        log.error("Install schedule: pip install schedule")
        return

    log.info("Starting ETL scheduler...")
    log.info("  Daily at 08:00 — FX, oil price, stock index")
    log.info("  Weekly on Monday — Monthly indicators check")
    log.info("  Monthly on 1st — Full refresh")

    schedule.every().day.at("08:00").do(fetch_daily)
    schedule.every().monday.at("09:00").do(fetch_monthly)
    schedule.every(30).days.do(fetch_all)

    # Run initial fetch
    fetch_all()

    while True:
        schedule.run_pending()
        time.sleep(60)


# ── Export to Dashboard Format ────────────────────────────────
def export_for_dashboard():
    """
    Export all stored time-series into a single JSON file
    that the dashboard can consume directly.
    """
    output = {"series": {}, "last_updated": datetime.utcnow().isoformat() + "Z"}

    for f in sorted(DATA_DIR.glob("ts_*.json")):
        indicator_id = f.stem.replace("ts_", "")
        with open(f) as fh:
            records = json.load(fh)

        dates = [r["date"] for r in records]
        values = [r["value"] for r in records]
        output["series"][indicator_id] = {"dates": dates, "values": values}

    outfile = BASE_DIR / "data" / "dashboard_data.json"
    with open(outfile, "w") as f:
        json.dump(output, f)

    log.info(f"Dashboard data exported to {outfile}")


# ── CLI ───────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Nigeria Economic Dashboard ETL")
    parser.add_argument("--all", action="store_true", help="Fetch all indicators")
    parser.add_argument("--daily", action="store_true", help="Fetch daily indicators")
    parser.add_argument("--monthly", action="store_true", help="Fetch monthly indicators")
    parser.add_argument("--schedule", action="store_true", help="Run scheduled updates")
    parser.add_argument("--validate", action="store_true", help="Validate stored data")
    parser.add_argument("--export", action="store_true", help="Export data for dashboard")
    parser.add_argument("--indicator", type=str, help="Fetch specific indicator by ID")
    args = parser.parse_args()

    if args.schedule:
        run_scheduler()
    elif args.all:
        fetch_all()
    elif args.daily:
        fetch_daily()
    elif args.monthly:
        fetch_monthly()
    elif args.validate:
        validate_data()
    elif args.export:
        export_for_dashboard()
    elif args.indicator:
        if args.indicator in WB_INDICATORS:
            records = fetch_world_bank(args.indicator, WB_INDICATORS[args.indicator])
            save_timeseries(args.indicator, records)
        else:
            log.error(f"Unknown indicator: {args.indicator}")
            log.info(f"Available: {', '.join(WB_INDICATORS.keys())}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
