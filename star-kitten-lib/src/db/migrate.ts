import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { join } from 'node:path';
import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { DB_PATH } from '.';

const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);
migrate(db, { migrationsFolder: join(process.cwd(), '/drizzle') });
