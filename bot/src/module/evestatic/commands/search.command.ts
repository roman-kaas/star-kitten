import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { itemLookup, resumeItemLookup } from '../lib/ItemLookup';
import { ResumeCommand } from 'star-kitten-lib/db';
import type { ResumeableInteraction } from '@lib/discord';

export const data = new SlashCommandBuilder()
  .setName('search')
  .setDescription('Get info about EVE things.')
  .addStringOption((option) => option.setName('name').setDescription('The type name').setRequired(true))
  .addBooleanOption((option) => option.setName('public').setDescription('Should the response be publicly visible in the channel so everyone can see it?').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const isPublic = interaction.options.getBoolean('public') ?? false;
  return itemLookup(interaction, { ephemeral: !isPublic, type: 'Type' }, (messageId: string) => {
    ResumeCommand.create(messageId, 'search', { name: interaction.options.getString('name') ?? '' }).save();
  });
}

export async function resume(interaction: ResumeableInteraction, params: { category: number, name: string, public: boolean }, context?: any) {
  return resumeItemLookup(interaction, { ephemeral: !params.public, type: 'Type' }, params.name, (messageId: string) => {
    ResumeCommand.create(messageId, 'search', { name: params.name }).save();
  });
}
