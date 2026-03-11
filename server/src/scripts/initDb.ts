import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

async function initDatabase() {
  console.log('Initializing database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pool.connect();
    
    // Create indicators table
    await client.query(`
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
    console.log('✓ indicators table created');

    // Create timeseries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS timeseries (
        id SERIAL PRIMARY KEY,
        indicator_id VARCHAR(50) NOT NULL REFERENCES indicators(id),
        date VARCHAR(10) NOT NULL,
        value NUMERIC(20, 4),
        provenance TEXT,
        source_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(indicator_id, date)
      )
    `);
    console.log('✓ timeseries table created');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_timeseries_indicator_date 
      ON timeseries(indicator_id, date DESC)
    `);
    console.log('✓ index created');

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        category VARCHAR(30),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ events table created');

    // Create etl_logs table
    await client.query(`
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
    console.log('✓ etl_logs table created');

    // Create api_cache table
    await client.query(`
      CREATE TABLE IF NOT EXISTS api_cache (
        key VARCHAR(100) PRIMARY KEY,
        data JSONB NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ api_cache table created');

    client.release();
    await pool.end();
    
    console.log('\n✅ Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    await pool.end();
    process.exit(1);
  }
}

initDatabase();
