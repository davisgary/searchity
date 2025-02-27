import { Client } from '@neondatabase/serverless';

export function createDbClient() {
  return new Client({
    connectionString: process.env.DATABASE_URL,
  });
}