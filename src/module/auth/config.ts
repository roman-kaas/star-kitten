import { join } from 'node:path';

export const DATABASE_KEY = 'eveauth';
export const DB_PATH = process.env.AUTH_DB_PATH || join(process.cwd(), 'litefs/eveauth.db');
export const MODEL_DIR = join(__dirname, 'models');
export const MODEL_PATTERN = '**/*.model.ts';

