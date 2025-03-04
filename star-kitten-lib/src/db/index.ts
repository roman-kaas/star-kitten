import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { join } from 'node:path';
import { characters, resumeCommands, users } from './schema';

export const DB_PATH = process.env.AUTH_DB_PATH || join(process.cwd(), '../litefs/kitten.db');

export * as schema from './schema';
export * as models from './models';
export * from './models';

const sqlite = new Database(DB_PATH);
export const db = drizzle(sqlite, { schema: { users, characters, resumeCommands } });
