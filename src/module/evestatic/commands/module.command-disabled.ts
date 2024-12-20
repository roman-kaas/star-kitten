import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MarkgetGroupIds } from '$module/evestatic/lib/search';
import { itemLookup } from '../lib/ItemLookup';

export const data = new SlashCommandBuilder()
  .setName('module')
  .setDescription('Get information about a module')
  .addStringOption((option) => option.setName('name').setDescription('The name of the module').setRequired(true))
  .addBooleanOption((option) => option.setName('public').setDescription('Should the response be publicly visible to others?').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const isPublic = interaction.options.getBoolean('public') ?? false;
  itemLookup(interaction, { category: MarkgetGroupIds.Modules, ephemeral: !isPublic, type: 'Module' });
}
