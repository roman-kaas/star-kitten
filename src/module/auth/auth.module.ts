import { ESI_SCOPES, joinScopes } from '$eve/esi';
import type { AppModule } from '$lib/StarKitten';
import { DATABASE_KEY, DB_PATH, MODEL_DIR, MODEL_PATTERN } from './config';
import { db } from './lib';

let didInit = false;
const init = async () => {
  if (didInit) return;
  didInit = true;
  await db.initializeDatabase();
}

export default {
  name: 'Auth',
  description: 'Eve Online authentication and user management.',
  scopes: joinScopes(ESI_SCOPES.PUBLIC_DATA),
  dependencies: [],
  database: {
    name: DATABASE_KEY,
    path: DB_PATH,
    modelsPattern: MODEL_PATTERN,
    modelsDir: MODEL_DIR,
  },
  init,
} as AppModule;
