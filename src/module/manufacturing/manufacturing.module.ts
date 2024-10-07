import { ESI_SCOPES, joinScopes } from '$eve/esi';
import type { AppModule } from '$lib/StarKitten';
import { join } from 'node:path';

export default {
  name: 'Manufacturing',
  description: 'Industry and manufacturing related commands.',
  dependencies: ['Auth', 'Characters'],
  scopes: joinScopes(
    ESI_SCOPES.PUBLIC_DATA,
    ESI_SCOPES.ASSETS_READ_ASSETS,
    ESI_SCOPES.SKILLS_READ_SKILLS,
    ESI_SCOPES.INDUSTRY_READ_CHARACTER_JOBS,
    ESI_SCOPES.CHARACTERS_READ_BLUEPRINTS,
  ),
  database: {
    name: 'manufacturing',
    path: join(process.cwd(), 'data/manufacturing.db'),
    modelsPattern: '**/*.model.ts',
    modelsDir: join(__dirname, 'models'),
  },
} as AppModule;
