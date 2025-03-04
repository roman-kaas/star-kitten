import { SCOPES } from 'star-kitten-lib/eve';
import type { AppModule } from '@lib/StarKitten';

const init = async () => {
};

const allScopes = Object.values(SCOPES).filter((value) => typeof value === 'string') as string[];
const allScopesString = allScopes.join(' ');

export default {
  name: 'Full ESI',
  description:
    'Adds all scopes for Full ESI. This will enable all modules.',
  scopes: allScopesString,
  dependencies: ['Characters'],
  init,
} as AppModule;
