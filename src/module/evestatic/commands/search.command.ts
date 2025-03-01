import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MarkgetGroupIds } from '../lib/search';
import { itemLookup, resumeItemLookup } from '../lib/ItemLookup';
import { ResumeCommand } from '$lib/discord/utils/navigation/resumeCommand.model';
import type { ResumeableInteraction } from '$lib/discord';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Get info about EVE things.')
  .addNumberOption((options) =>
    options
      .setName('category')
      .setDescription('The category of the thing you want to search for.')
      .setRequired(true)
      .addChoices(
        ...Object.entries(MarkgetGroupIds)
          .filter(([name, value]) => typeof value !== 'string')
          .map(([name, value]) => ({ name, value: parseInt(value as any) })),
      ),
  )
  .addStringOption((option) => option.setName('name').setDescription('The type name').setRequired(true))
  .addBooleanOption((option) => option.setName('hidden').setDescription('Should the response be hidden so only you can see it?').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const category = interaction.options.getNumber('category');
  const isHidden = interaction.options.getBoolean('hidden') ?? false;
  return itemLookup(interaction, { category, ephemeral: isHidden, type: 'Type' }, (messageId: string) => {
    App.db.save(ResumeCommand.create(messageId, 'search', { category, name: interaction.options.getString('name') ?? '' }));
  });
}

export async function resume(interaction: ResumeableInteraction, params: { category: number, name: string, public: boolean }, context?: any) {
  return resumeItemLookup(interaction, { category: params.category, ephemeral: !params.public, type: 'Type' }, params.name, (messageId: string) => {
    App.db.save(ResumeCommand.create(messageId, 'search', { category: params.category, name: params.name }));
  });
}
