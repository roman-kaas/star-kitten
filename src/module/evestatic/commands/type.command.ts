import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MarkgetGroupIds } from '../lib/search';
import { itemLookup } from '../lib/ItemLookup';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Get detailed information about nearly any item in game.')
  .addNumberOption((options) =>
    options
      .setName('category')
      .setDescription('The category of the item')
      .setRequired(true)
      .addChoices(
        ...Object.entries(MarkgetGroupIds)
          .filter(([name, value]) => typeof value !== 'string')
          .map(([name, value]) => ({ name, value: parseInt(value as any) })),
      ),
  )
  .addStringOption((option) => option.setName('name').setDescription('The type name').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const category = interaction.options.getNumber('category');
  return itemLookup(interaction, { category, ephemeral: true, type: 'Type' });
}
