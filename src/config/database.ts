import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isLocalhost =
  process.env.DB_HOST === 'localhost' ||
  process.env.DB_HOST === '127.0.0.1' ||
  process.env.DATABASE_URL?.includes('localhost') ||
  process.env.DATABASE_URL?.includes('127.0.0.1');

const useSsl = process.env.DB_SSL !== undefined
  ? process.env.DB_SSL === 'true'
  : !isLocalhost && Boolean(process.env.DATABASE_URL || process.env.DB_HOST);

const poolConfig: any = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

if (useSsl) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

export default pool;