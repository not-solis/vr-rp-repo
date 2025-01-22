import pg, { PoolClient, PoolConfig } from 'pg';
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
export const makeTransaction = (
  transaction: (client: PoolClient) => void,
  onError: (err: any) => void,
) => {
  let client: PoolClient;
  pool
    .connect()
    .then(async (poolClient) => {
      client = poolClient;
      await client.query('BEGIN');
      return client;
    })
    .then(transaction)
    .then(async () => await client.query('COMMIT'))
    .catch(console.error)
    .catch(onError)
    .finally(async () => {
      await client?.query('ROLLBACK');
      client?.release();
    });
};
