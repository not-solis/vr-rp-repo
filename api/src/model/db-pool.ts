import pg, { PoolConfig } from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;

dotenv.config();

const connectionDetails: PoolConfig = {
  user: process.env.POSTGRES_DB_USER,
  host: process.env.POSTGRES_DB_HOST,
  database: process.env.POSTGRES_DB_DATABASE,
  password: process.env.POSTGRES_DB_PASSWORD,
  port: parseInt(process.env.POSTGRES_DB_PORT!) ?? 5432,
};

export const pool = new Pool(connectionDetails);
