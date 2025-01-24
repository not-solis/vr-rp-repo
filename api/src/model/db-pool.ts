import pg, { PoolClient, PoolConfig } from 'pg';
import dotenv from 'dotenv';
const { Pool } = pg;

dotenv.config();

const {
  POSTGRES_URL,
  POSTGRES_USER,
  POSTGRES_HOST,
  POSTGRES_DATABASE,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
} = process.env;

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
    .catch(console.error)
    .catch(onError)
    .finally(async () => {
      await client?.query('ROLLBACK');
      client?.release();
    });
};
