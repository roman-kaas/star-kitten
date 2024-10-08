import { ESI_SCOPES, joinScopes } from '$eve/esi';
import type { AppModule } from '$lib/StarKitten';
import { DB } from '$lib/zORM';
import { join } from 'node:path';

const DATABASE_KEY = 'skills';
const DB_PATH = process.env.SKILLS_DB_PATH || join(process.cwd(), 'litefs/skills.db');
const MODEL_DIR = join(__dirname, 'models');
const MODEL_PATTERN = '**/*.model.ts';

let didInit = false;
const init = async () => {
  // if (didInit) return;
  // didInit = true;
  // console.debug('Initializing Skills module');
  // DB.getDB(DATABASE_KEY).initialize({
  //   database: DB_PATH,
  //   modelPattern: MODEL_PATTERN,
  //   modelPath: MODEL_DIR,
  // })
};

export default {
  name: 'Skills',
  description:
    'View your character skills and skill queue. If enabled, will update other modules with skill data. eg. Manufacturing info, skill requirements...',
  scopes: joinScopes(ESI_SCOPES.PUBLIC_DATA, ESI_SCOPES.SKILLS_READ_SKILLS, ESI_SCOPES.SKILLS_READ_SKILLQUEUE),
  dependencies: ['Auth', 'Characters'],
  database: {
    name: DATABASE_KEY,
    path: DB_PATH,
    modelsPattern: MODEL_PATTERN,
    modelsDir: MODEL_DIR,
  },
  init,
} as AppModule;
