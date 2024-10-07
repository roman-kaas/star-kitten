import { StarKitten } from '$lib/StarKitten';

global.App = new StarKitten();
await global.App.start();
