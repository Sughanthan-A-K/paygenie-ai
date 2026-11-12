import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || '';

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    })
  : null;

export async function query(text: string, params?: any[]) {
  if (!pool) throw new Error('DATABASE_URL not configured');
  return pool.query(text, params);
}

export default pool;
