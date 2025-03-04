import { SCOPES, joinScopes } from 'star-kitten-lib/eve';
import type { AppModule } from '@lib/StarKitten';
import { join } from 'node:path';

export default {
  disabled: true,
  name: 'Manufacturing',
  description: 'Industry and manufacturing related commands.',
  dependencies: ['Characters', 'EveStatic'],
  scopes: joinScopes(
    SCOPES.PUBLIC_DATA,
    SCOPES.ASSETS_READ_ASSETS,
    SCOPES.SKILLS_READ_SKILLS,
    SCOPES.INDUSTRY_READ_CHARACTER_JOBS,
    SCOPES.CHARACTERS_READ_BLUEPRINTS,
  ),
  database: {
    name: 'manufacturing',
    path: join(process.cwd(), 'data/manufacturing.db'),
    modelsPattern: '**/*.model.ts',
    modelsDir: join(__dirname, 'models'),
  },
} as AppModule;
