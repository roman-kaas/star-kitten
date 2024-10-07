import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { MarkgetGroupIds } from '$module/evestatic/lib/search';
import { itemLookup } from '../lib/ItemLookup';

export const data = new SlashCommandBuilder()
  .setName('structure')
  .setDescription('Get information about a structure')
  .addStringOption((option) => option.setName('name').setDescription('The name of the structure').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  itemLookup(interaction, { category: MarkgetGroupIds.STRUCTURES, ephemeral: false, type: 'Structure' });
}
