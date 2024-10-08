import { DB } from '$lib/zORM';
import { DATABASE_KEY, DB_PATH, MODEL_DIR, MODEL_PATTERN } from '../config';
import { Character, User } from '../models';

export async function initializeDatabase() {
  await DB.getDB(DATABASE_KEY).initialize({
    database: DB_PATH,
    modelPattern: MODEL_PATTERN,
    modelPath: MODEL_DIR,
    enableWal: true,
    enableForeignKeys: true,
  });
}

export function getUser(id: number): User | undefined {
  return DB.getDB(DATABASE_KEY).getRepository(User).findOne(id);
}

export function getUserByDiscordId(discordID: string): User | undefined {
  return DB.getDB(DATABASE_KEY).getRepository(User).find({ discordID })?.[0];
}

export function getCharacter(id: number): Character | undefined {
  return DB.getDB(DATABASE_KEY).getRepository(Character).findOne(id);
}

export function save(model: { constructor: { name: string } }) {
  return DB.getDB(DATABASE_KEY).getRepository(model.constructor.name).save(model);
}

export function deleteModel(model: { constructor: { name: string } }) {
  return DB.getDB(DATABASE_KEY).getRepository(model.constructor.name).delete(model);
}
