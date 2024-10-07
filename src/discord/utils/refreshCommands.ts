import { REST, Routes } from 'discord.js';

interface Options {
  token?: string;
  appId?: string;
  guildId?: string;
}

/**
 * Refreshes the application (/) commands or guild (/) commands.
 * If a guild ID is provided, it will refresh the guild (/) commands.
 * If no guild ID is provided, it will refresh the application (/) commands globally.
 * @param {Object} options - { commands, commandDir, pattern, token, appId, guildId }
 * @returns none
 */
export async function refreshCommands(client: Client, options: Partial<Options> = {}) {

  const token = options.token || global.App.config.discord.token;
  const appId = options.appId || global.App.config.discord.appId;

  if (!token) {
    console.warn('Missing Discord bot token. Please provide a token with the DISCORD_BOT_TOKEN environment variable.');
    return;
  }

  if (!appId) {
    console.warn(
      'Missing Discord application ID. Please provide an application ID with the DISCORD_APP_ID environment variable.',
    );
    return;
  }

  const rest = new REST().setToken(client.token || token);

  try {
    console.debug('Refreshing application (/) commands.');
    const response = await rest.put(
      options.guildId ? Routes.applicationGuildCommands(appId, options.guildId) : Routes.applicationCommands(appId),
      { body: client.commands.map((command) => command.data.toJSON()) },
    );
    console.debug('Successfully refreshed application (/) commands.');
  } catch (error) {
    console.error(`Failed to refresh application (/) commands: ${error}`);
  }
}
