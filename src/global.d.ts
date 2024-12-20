import type { Collection, Client as DJSClient } from 'discord.js';
import type { Command } from '$lib/discord/utils/loadCommands';
import type { StarKitten } from '$lib/StarKitten';

export { };

declare global {
  interface Client extends DJSClient {
    commands?: Collection<string, Command>;
    collectors?: Collection<string, boolean>;
  }
  var App: StarKitten;
}
