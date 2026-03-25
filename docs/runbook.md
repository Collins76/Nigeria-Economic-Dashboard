# Operations Runbook

## Daily Operations

### Check ETL Status
```bash
# View recent ETL logs
tail -50 logs/etl.log

# Check provenance for today's fetches
grep "$(date +%Y-%m-%d)" data/provenance.jsonl

# Validate data integrity
python etl/pipeline.py --validate
```

### Manual Data Refresh
```bash
# Refresh all indicators
python etl/pipeline.py --all

# Refresh only daily indicators (FX, oil, stocks)
python etl/pipeline.py --daily

# Refresh specific indicator
python etl/pipeline.py --indicator cpi_headline
```

## Troubleshooting

### World Bank API returns empty data
- **Cause**: API may be down, or indicator code changed
- **Fix**: Check https://api.worldbank.org/v2 status; verify indicator codes in `etl/schedule.yaml`
- **Fallback**: Use IMF API or download CSV from World Bank Data portal

### Exchange rate data missing
- **Cause**: CBN website structure may have changed
- **Fix**: Check CBN website manually; update scraper selectors in pipeline
- **Fallback**: Use FMDQ or parallel market sources

### Dashboard shows stale data
- **Check**: `data/indicators.json` last-modified timestamp
- **Check**: ETL log for errors
- **Fix**: Run `python etl/pipeline.py --all && python etl/pipeline.py --export`

### Charts not loading
- **Check**: Browser console for JS errors
- **Check**: CDN libraries accessible (Chart.js, PapaParse, SheetJS)
- **Fix**: If CDN is blocked, download libraries locally and update script src paths

## Deployment

### Docker Deployment
```bash
docker build -t nigeria-dashboard .
docker run -d --name dashboard -p 8080:80 nigeria-dashboard

# Check container status
docker ps
docker logs dashboard
```

### Static File Deployment
```bash
# Copy to web server
scp index.html user@server:/var/www/html/dashboard/
scp -r data/ user@server:/var/www/html/dashboard/

# Or deploy to cloud storage
aws s3 sync . s3://nigeria-dashboard/ --exclude "etl/*" --exclude "logs/*"
```

### Setting Up Scheduled ETL (Linux/cron)
```bash
# Edit crontab
crontab -e

# Daily fetch at 8:00 AM WAT (7:00 UTC)
0 7 * * * cd /path/to/dashboard && python etl/pipeline.py --daily >> logs/cron.log 2>&1

# Monthly fetch on 15th at 10:00 AM WAT
0 9 15 * * cd /path/to/dashboard && python etl/pipeline.py --monthly >> logs/cron.log 2>&1

# Full refresh on 1st of each month
0 9 1 * * cd /path/to/dashboard && python etl/pipeline.py --all >> logs/cron.log 2>&1
```

## Monitoring Checklist

- [ ] ETL runs successfully (check `logs/etl.log` daily)
- [ ] No validation errors (`python etl/pipeline.py --validate`)
- [ ] Data freshness: most recent dates within expected range
- [ ] Dashboard loads in < 2s on desktop
- [ ] All charts render correctly
- [ ] Export (CSV/Excel/PNG) functions work
- [ ] Mobile layout renders correctly

## Backup & Recovery

### Backup data
```bash
cp -r data/ backups/data_$(date +%Y%m%d)/
```

### Restore from snapshot
```bash
# List available snapshots
ls data/snapshots/

# Snapshots are full JSON dumps created after each ETL run
```

## Contact

- **Data issues**: Check source websites first, then escalate
- **Dashboard bugs**: File issue in repository
- **ETL failures**: Check logs, retry, escalate if persistent
