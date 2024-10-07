import { ESI_SCOPES, joinScopes } from '$eve/esi';
import type { AppModule } from '$lib/StarKitten';
import { DB } from '$lib/zORM';
import { DATABASE_KEY, DB_PATH, MODEL_PATTERN, MODEL_DIR } from './config';

let didInit = false;
const init = async () => {
  if (didInit) return;
  didInit = true;
  console.debug('Initializing Characters module');
  DB.getDB(DATABASE_KEY).initialize({
    database: DB_PATH,
    modelPattern: MODEL_PATTERN,
    modelPath: MODEL_DIR,
  })
}

export default {
  name: 'Characters',
  description: 'Manage your EVE Online characters.',
  dependencies: ['Auth'],
  scopes: joinScopes(ESI_SCOPES.PUBLIC_DATA),
  database: {
    name: DATABASE_KEY,
    path: DB_PATH,
    modelsPattern: MODEL_PATTERN,
    modelsDir: MODEL_DIR,
  },
  init,
} as AppModule;
