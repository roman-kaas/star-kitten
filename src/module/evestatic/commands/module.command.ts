import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { MarkgetGroupIds } from '$module/evestatic/lib/search';
import { itemLookup } from '../lib/ItemLookup';

export const data = new SlashCommandBuilder()
  .setName('module')
  .setDescription('Get information about a module')
  .addStringOption((option) => option.setName('name').setDescription('The name of the module').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  itemLookup(interaction, { category: MarkgetGroupIds.MODULES, ephemeral: false, type: 'Module' });
}
