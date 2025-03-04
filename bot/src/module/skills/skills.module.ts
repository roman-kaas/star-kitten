import { joinScopes, SCOPES } from 'star-kitten-lib/eve';
import type { AppModule } from '@lib/StarKitten';
import { join } from 'node:path';

const DATABASE_KEY = 'skills';
const DB_PATH = process.env.SKILLS_DB_PATH || join(process.cwd(), '../litefs/skills.db');
const MODEL_DIR = join(__dirname, 'models');
const MODEL_PATTERN = '**/*.model.ts';

let didInit = false;
const init = async () => {
};

export default {
  name: 'Skills',
  description:
    'View your character skills and skill queue. If enabled, will update other modules with skill data.',
  scopes: joinScopes(SCOPES.PUBLIC_DATA, SCOPES.SKILLS_READ_SKILLS, SCOPES.SKILLS_READ_SKILLQUEUE),
  dependencies: ['Characters'],
  database: {
    name: DATABASE_KEY,
    path: DB_PATH,
    modelsPattern: MODEL_PATTERN,
    modelsDir: MODEL_DIR,
  },
  init,
} as AppModule;
