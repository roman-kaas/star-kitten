import type { AppModule } from '@lib/StarKitten';
import { initialize } from './lib/search';

const init = async () => {
  // pre-load data for commands
  await initialize();
};

export default {
  name: 'EveStatic',
  description: 'Static data for Eve Online.',
  scopes: '',
  dependencies: [],
  init,
} as AppModule;
