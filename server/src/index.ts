import express from 'express';
import cors from 'cors';
import { query } from './config/database.js';
import { INDICATOR_DEFINITIONS } from './config/indicators.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', message: String(error) });
  }
});

// Get all indicators
app.get('/api/indicators', async (req, res) => {
  try {
    const result = await query('SELECT * FROM indicators ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get single indicator with timeseries
app.get('/api/indicators/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    const indicatorResult = await query('SELECT * FROM indicators WHERE id = $1', [id]);
    if (indicatorResult.rows.length === 0) {
      return res.status(404). 'Indicator not found' });
    }

    let tsQueryjson({ error: = 'SELECT * FROM timeseries WHERE indicator_id = $1';
    const params: any[] = [id];
    
    if (from) {
      tsQuery += ' AND date >= $2';
      params.push(from);
    }
    if (to) {
      tsQuery += ' AND date <= $' + (params.length + 1);
      params.push(to);
    }
    tsQuery += ' ORDER BY date ASC';

    const tsResult = await query(tsQuery, params);
    
    res.json({
      indicator: indicatorResult.rows[0],
      timeseries: tsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get latest values for all indicators
app.get('/api/latest', async (req, res) => {
  try {
    const result = await query(`
      SELECT i.*, t.value as latest_value, t.date as latest_date
      FROM indicators i
      LEFT JOIN LATERAL (
        SELECT value, date FROM timeseries 
        WHERE indicator_id = i.id 
        ORDER BY date DESC LIMIT 1
      ) t ON true
      ORDER BY i.category, i.name
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get events
app.get('/api/events', async (req, res) => {
  try {
    const { from, to, category } = req.query;
    
    let queryText = 'SELECT * FROM events WHERE 1=1';
    const params: any[] = [];
    
    if (from) {
      params.push(from);
      queryText += ` AND date >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      queryText += ` AND date <= $${params.length}`;
    }
    if (category) {
      params.push(category);
      queryText += ` AND category = $${params.length}`;
    }
    
    queryText += ' ORDER BY date DESC';
    
    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Get ETL logs
app.get('/api/etl-logs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM etl_logs ORDER BY started_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Seed/reset data (for development)
app.post('/api/seed', async (req, res) => {
  try {
    // Seed indicators
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
    res.json({ message: 'Seed completed' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
