import { DB } from '$lib/zORM';
import { ResumeCommand } from '$lib/discord/utils/navigation/resumeCommand.model';
import { join } from 'node:path';

const DATABASE_KEY = 'kitten';
const DB_PATH = process.env.KITTEN_DB_PATH || join(process.cwd(), 'litefs/kitten.db');
const MODEL_DIR = __dirname;
const MODEL_PATTERN = '**/*.model.ts';

export async function initializeDatabase() {
  await DB.getDB(DATABASE_KEY).initialize({
    database: DB_PATH,
    modelPattern: MODEL_PATTERN,
    modelPath: MODEL_DIR,
    enableWal: true,
    enableForeignKeys: true,
  });
}

type KittenModel = ResumeCommand;

export function getResumeCommand(messageId: string): ResumeCommand | undefined {
  return DB.getDB(DATABASE_KEY).getRepository(ResumeCommand).findOne(messageId);
}

export function save(model: KittenModel) {
  return DB.getDB(DATABASE_KEY).getRepository(model.constructor.name).save(model);
}

export function deleteModel(model: KittenModel) {
  return DB.getDB(DATABASE_KEY).getRepository(model.constructor.name).delete(model.id);
}

export function deleteResumeCommandForMessage(messageId: string) {
  return DB.getDB(DATABASE_KEY).getRepository(ResumeCommand).delete(messageId);
}
