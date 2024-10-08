import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MarkgetGroupIds } from '$module/evestatic/lib/search';
import { itemLookup } from '../lib/ItemLookup';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Get information about a ship')
  .addStringOption((option) => option.setName('name').setDescription('The name of the ship').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  itemLookup(interaction, { category: MarkgetGroupIds.Ships, ephemeral: false, type: 'Ship' });
}
