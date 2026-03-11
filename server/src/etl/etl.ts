import axios from 'axios';
import { query } from '../config/database.js';
import { INDICATOR_DEFINITIONS, ECONOMIC_EVENTS } from '../config/indicators.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

export async function fetchWorldBankData(indicatorId: string): Promise<{date: string, value: number}[]> {
  const indicator = INDICATOR_DEFINITIONS.find(i => i.id === indicatorId);
  if (!indicator?.apiEndpoint) {
    logger.warn(`No API endpoint for ${indicatorId}`);
    return [];
  }

  try {
    const response = await axios.get(indicator.apiEndpoint, {
      params: { per_page: 100, format: 'json' },
      timeout: 30000
    });

    const data = response.data[1] || [];
    return data
      .filter((item: any) => item.value !== null)
      .map((item: any) => ({
        date: item.date,
        value: item.value
      }))
      .reverse();
  } catch (error) {
    logger.error(`Failed to fetch ${indicatorId}:`, error);
    return [];
  }
}

export async function seedIndicators() {
  logger.info('Seeding indicators...');
  
  for (const ind of INDICATOR_DEFINITIONS) {
    await query(
      `INSERT INTO indicators (id, name, short_name, category, unit, frequency, source, source_url, description, positive_direction, color, last_updated, update_cadence)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         short_name = EXCLUDED.short_name,
         category = EXCLUDED.category,
         unit = EXCLUDED.unit,
         frequency = EXCLUDED.frequency,
         source = EXCLUDED.source,
         source_url = EXCLUDED.source_url,
         description = EXCLUDED.description,
         positive_direction = EXCLUDED.positive_direction,
         color = EXCLUDED.color,
         last_updated = EXCLUDED.last_updated,
         update_cadence = EXCLUDED.update_cadence,
         updated_at = CURRENT_TIMESTAMP`,
      [ind.id, ind.name, ind.shortName, ind.category, ind.unit, ind.frequency, ind.source, ind.sourceUrl, ind.description, ind.positiveDirection, ind.color, ind.lastUpdated, ind.updateCadence]
    );
  }
  
  logger.info('Indicators seeded successfully');
}

export async function seedEvents() {
  logger.info('Seeding events...');
  
  for (const event of ECONOMIC_EVENTS) {
    await query(
      `INSERT INTO events (date, title, description, category)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [event.date, event.title, event.description, event.category]
    );
  }
  
  logger.info('Events seeded successfully');
}

export async function runETL(indicatorId?: string) {
  const startTime = Date.now();
  const jobName = indicatorId ? `etl_${indicatorId}` : 'etl_all';
  let hasUpdates = false;
  
  try {
    await query(
      `INSERT INTO etl_logs (job_name, status, records_processed, started_at)
       VALUES ($1, 'running', 0, CURRENT_TIMESTAMP)
       RETURNING id`,
      [jobName]
    );

    if (indicatorId) {
      const data = await fetchWorldBankData(indicatorId);
      
      for (const point of data) {
        await query(
          `INSERT INTO timeseries (indicator_id, date, value, provenance)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (indicator_id, date) DO UPDATE SET
             value = EXCLUDED.value,
             provenance = EXCLUDED.provenance`,
          [indicatorId, point.date, point.value, 'World Bank API']
        );
      }

      await query(
        `UPDATE indicators SET last_updated = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [indicatorId]
      );

      logger.info(`ETL completed for ${indicatorId}: ${data.length} records`);
      hasUpdates = data.length > 0;
    } else {
      let totalRecords = 0;
      for (const ind of INDICATOR_DEFINITIONS) {
        if (ind.apiEndpoint) {
          const data = await fetchWorldBankData(ind.id);
          for (const point of data) {
            await query(
              `INSERT INTO timeseries (indicator_id, date, value, provenance)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (indicator_id, date) DO UPDATE SET
                 value = EXCLUDED.value`,
              [ind.id, point.date, point.value, 'World Bank API']
            );
          }
          totalRecords += data.length;
        }
      }
      logger.info(`ETL completed: ${totalRecords} total records`);
      hasUpdates = totalRecords > 0;
    }

    await query(
      `UPDATE etl_logs SET status = 'completed', records_processed = $1, completed_at = CURRENT_TIMESTAMP WHERE job_name = $2 AND status = 'running'`,
      [indicatorId ? 1 : INDICATOR_DEFINITIONS.length, jobName]
    );

  } catch (error: any) {
    logger.error(`ETL failed for ${jobName}:`, error);
    await query(
      `UPDATE etl_logs SET status = 'failed', error_message = $1, completed_at = CURRENT_TIMESTAMP WHERE job_name = $2 AND status = 'running'`,
      [error.message, jobName]
    );
  }

  console.log(`::set-output name=has_updates::${hasUpdates}`);
  return hasUpdates;
}

runETL()
  .then(() => {
    console.log('ETL script completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('ETL script failed:', err);
    process.exit(1);
  });
