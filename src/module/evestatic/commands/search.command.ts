import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { MarkgetGroupIds } from '../lib/search';
import { itemLookup, resumeItemLookup } from '../lib/ItemLookup';
import { ResumeCommand } from '$lib/discord/utils/navigation/resumeCommand.model';
import type { ResumeableInteraction } from '$lib/discord';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Get info about EVE things.')
  .addStringOption((option) => option.setName('name').setDescription('The type name').setRequired(true))
  .addBooleanOption((option) => option.setName('public').setDescription('Should the response be publicly visible in the channel so everyone can see it?').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const category = MarkgetGroupIds.All;
  const isPublic = interaction.options.getBoolean('public') ?? false;
  return itemLookup(interaction, { category, ephemeral: !isPublic, type: 'Type' }, (messageId: string) => {
    App.db.save(ResumeCommand.create(messageId, 'search', { category, name: interaction.options.getString('name') ?? '' }));
  });
}

export async function resume(interaction: ResumeableInteraction, params: { category: number, name: string, public: boolean }, context?: any) {
  return resumeItemLookup(interaction, { category: params.category, ephemeral: !params.public, type: 'Type' }, params.name, (messageId: string) => {
    App.db.save(ResumeCommand.create(messageId, 'search', { category: params.category, name: params.name }));
  });
}
