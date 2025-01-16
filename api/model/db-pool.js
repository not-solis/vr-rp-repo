import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionDetails = {
  user: process.env.POSTGRES_DB_USER,
  host: process.env.POSTGRES_DB_HOST,
  database: process.env.POSTGRES_DB_DATABASE,
  password: process.env.POSTGRES_DB_PASSWORD,
  port: process.env.POSTGRES_DB_PORT,
};

export const pool = new pg.Pool(connectionDetails);
