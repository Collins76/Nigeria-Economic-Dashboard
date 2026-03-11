import { query } from '../config/database.js';

export async function initDatabase() {
  console.log('Initializing database schema...');
  
  // Create indicators table
  await query(`
    CREATE TABLE IF NOT EXISTS indicators (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      short_name VARCHAR(50),
      category VARCHAR(50) NOT NULL,
      unit VARCHAR(30) NOT NULL,
      frequency VARCHAR(20) NOT NULL,
      source VARCHAR(100) NOT NULL,
      source_url TEXT,
      description TEXT,
      positive_direction VARCHAR(10) DEFAULT 'up',
      color VARCHAR(10),
      last_updated TIMESTAMP,
      update_cadence VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create timeseries table
  await query(`
    CREATE TABLE IF NOT EXISTS timeseries (
      id SERIAL PRIMARY KEY,
      indicator_id VARCHAR(50) NOT NULL REFERENCES indicators(id),
      date DATE NOT NULL,
      value NUMERIC(20, 4),
      provenance TEXT,
      source_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(indicator_id, date)
    )
  `);

  // Create index on timeseries for faster queries
  await query(`
    CREATE INDEX IF NOT EXISTS idx_timeseries_indicator_date 
    ON timeseries(indicator_id, date DESC)
  `);

  // Create events table
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(30),
      tags TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create etl_logs table for tracking data refresh
  await query(`
    CREATE TABLE IF NOT EXISTS etl_logs (
      id SERIAL PRIMARY KEY,
      job_name VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL,
      records_processed INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    )
  `);

  // Create api_cache table for caching
  await query(`
    CREATE TABLE IF NOT EXISTS api_cache (
      key VARCHAR(100) PRIMARY KEY,
      data JSONB NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Database schema initialized successfully');
}

// Run if called directly
initDatabase()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
