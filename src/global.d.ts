import type { Collection, Client as DJSClient } from 'discord.js';
import type { Command } from '$discord/utils/loadCommands';
import type { StarKitten } from '$lib/StarKitten';

export {};

declare global {
  interface Client extends DJSClient {
    commands?: Collection<string, Command>;
  }
  var App: StarKitten;
}
