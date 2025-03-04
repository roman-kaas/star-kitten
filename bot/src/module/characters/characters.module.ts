import { SCOPES, joinScopes } from 'star-kitten-lib/eve';
import type { AppModule } from '@lib/StarKitten';
import { DATABASE_KEY, DB_PATH, MODEL_PATTERN, MODEL_DIR } from './config';

const init = async () => {
};

export default {
  name: 'Characters',
  description: 'Manage your EVE Online characters.',
  dependencies: [],
  scopes: joinScopes(SCOPES.PUBLIC_DATA),
  database: {
    name: DATABASE_KEY,
    path: DB_PATH,
    modelsPattern: MODEL_PATTERN,
    modelsDir: MODEL_DIR,
  },
  init,
} as AppModule;
