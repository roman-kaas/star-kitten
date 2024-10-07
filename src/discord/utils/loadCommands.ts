import { Glob } from 'bun';
import { join } from 'node:path';
import { Collection, type SlashCommandBuilder, type CommandInteraction } from 'discord.js';

export interface Command {
  data: SlashCommandBuilder;
  execute(interaction: CommandInteraction): Promise<void>;
}

interface Options {
  commandDir?: string; // default: './src'
  pattern?: string; // default: '**/*.{js,ts}'
  commands: Collection<string, Command>;
}

/**
 * Loads commands from the specified directory and pattern.
 * default: 'commands' directory and **\/*.{js,ts}' pattern
 * @param {Object} options - { commandDir, pattern, commands }
 * @returns Collection<string, Command>
 */
export async function loadCommands({
  commandDir = join(process.cwd(), 'src'),
  pattern = '**/*.command.{js,ts}',
  commands,
}: Options) {
  const glob = new Glob(pattern);

  for await (const file of glob.scan({ cwd: commandDir, absolute: true })) {
    const command = await import(file);
    commands.set(command.data.name, command);
  }

  return commands;
}
