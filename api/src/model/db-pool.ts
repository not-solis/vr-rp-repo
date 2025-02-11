import pg, { PoolClient, PoolConfig } from 'pg';
import {
  POSTGRES_DATABASE,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_URL,
  POSTGRES_USER,
} from '../env/config.js';
const { Pool } = pg;

const connectionDetails: PoolConfig = POSTGRES_URL
  ? {
      connectionString: POSTGRES_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      user: POSTGRES_USER,
      host: POSTGRES_HOST,
      database: POSTGRES_DATABASE,
      password: POSTGRES_PASSWORD,
      port: parseInt(POSTGRES_PORT!) ?? undefined,
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
    .catch((err) => {
      console.error(err);
      onError(err);
    })
    .finally(async () => {
      await client?.query('ROLLBACK');
      client?.release();
    });
};
