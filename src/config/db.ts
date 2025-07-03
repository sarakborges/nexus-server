import { MongoClient, Db } from 'mongodb';
import config from '@/config/config.ts';

const connectionString = config.atlasUri;
const client = new MongoClient(connectionString);

let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db(config.dbName);
  }
  return db;
}
