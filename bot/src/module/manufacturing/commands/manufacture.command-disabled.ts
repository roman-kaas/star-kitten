import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { typeSearch } from "@module/evestatic/lib/search";

export const data = new SlashCommandBuilder()
  .setName('manufacture')
  .setDescription('Manufacture any eve item!')
  .addStringOption(option => option.setName('item').setDescription('The name of the item to manufacture').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const deferred = await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const name = interaction.options.getString('item') ?? '';
  const locale = interaction.locale?.split('-')[0] || 'en';

  const type = await typeSearch(name);
  if (!type) {
    interaction.editReply({ content: `Item ${name} not found` });
    return;
  }

  interaction.editReply(`You searched for ${type.name[locale]}. This module is still under development.`);
}
