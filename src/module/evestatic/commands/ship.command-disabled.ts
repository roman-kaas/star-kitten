import { SlashCommandBuilder, ChatInputCommandInteraction, type Message } from 'discord.js';
import { MarkgetGroupIds } from '$module/evestatic/lib/search';
import { itemLookup, resumeItemLookup } from '../lib/ItemLookup';
import * as kittenDB from '$lib/kittenDB';
import { ResumeCommand } from '$lib/discord/utils/navigation/resumeCommand.model';
import type { ResumeableInteraction } from '$lib/discord';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Get information about a ship')
  .addStringOption((option) => option.setName('name').setDescription('The name of the ship').setRequired(true))
  .addBooleanOption((option) => option.setName('public').setDescription('Should the response be publicly visible to others?').setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  const isPublic = interaction.options.getBoolean('public') ?? false;
  itemLookup(interaction, { category: MarkgetGroupIds.Ships, ephemeral: !isPublic, type: 'Ship' }, (messageId: string) => {
    kittenDB.save(ResumeCommand.create(messageId, 'ship', { name: interaction.options.getString('name') ?? '' }));
  });
}

export async function resume(interaction: ResumeableInteraction, params: { name: string, public: boolean }, context?: any) {
  resumeItemLookup(interaction, { category: MarkgetGroupIds.Ships, ephemeral: !params.public, type: 'Ship' }, params.name, (messageId: string) => {
    kittenDB.save(ResumeCommand.create(messageId, 'ship', { name: params.name }));
  });
}
