import type { AppModule } from "$lib/StarKitten";
import { MarkgetGroupIds, Search } from './lib/search';

const init = async () => {
  // pre-load data for commands
  Search.getInstance(MarkgetGroupIds.ALL);
  Search.getInstance(MarkgetGroupIds.SHIPS);
};

export default {
  name: 'EveStatic',
  description: 'Static data for Eve Online.',
  scopes: '',
  dependencies: [],
  init,
} as AppModule;
