import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';
import { MarkgetGroupIds } from '../lib/search';
import { itemLookup } from '../lib/ItemLookup';

export const data = new SlashCommandBuilder()
  .setName('type')
  .setDescription('Get information about a type')
  .addStringOption((option) => option.setName('name').setDescription('The type name').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  return itemLookup(interaction, { category: MarkgetGroupIds.ALL, ephemeral: true, type: 'Type' });
}
