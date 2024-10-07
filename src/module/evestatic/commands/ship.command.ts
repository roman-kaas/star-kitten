import {
  SlashCommandBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
} from 'discord.js';
import { createActionRow } from '$discord';
import { useNavigation } from '$discord/utils/navigation';
import { mainPage, fittingPage, skillsPage, industryPage, attributesPage } from './pages';
import { MarkgetGroupIds, Search } from '$module/evestatic/lib/search';
import type { TypeContext } from './type.command';

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Get information about a ship')
  .addStringOption((option) => option.setName('name').setDescription('The name of the ship').setRequired(true));

export enum PageKey {
  MAIN = 'main',
  ATTRIBUTES = 'attributes',
  FITTING = 'fitting',
  SKILLS = 'skills',
  INDUSTRY = 'industry',
}

export const buttonRow = (key: string) => createActionRow(
  { customId: PageKey.MAIN, label: 'Main', style: ButtonStyle.Primary, disabled: key === PageKey.MAIN },
  { customId: PageKey.ATTRIBUTES, label: 'Attributes', style: ButtonStyle.Primary, disabled: key === PageKey.ATTRIBUTES },
  { customId: PageKey.FITTING, label: 'Fitting', style: ButtonStyle.Primary, disabled: key === PageKey.FITTING },
  { customId: PageKey.SKILLS, label: 'Skills', style: ButtonStyle.Primary, disabled: key === PageKey.SKILLS },
  { customId: PageKey.INDUSTRY, label: 'Industry', style: ButtonStyle.Primary, disabled: key === PageKey.INDUSTRY },
);

export async function execute(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name') ?? '';

  const type = Search.getInstance(MarkgetGroupIds.SHIPS).searchByName(name);
  if (!type) {
    interaction.reply({ content: `Sorry, I could not find any ship from the terms \`${name}\``, ephemeral: true });
    return;
  }

  console.debug(`found ship ${type.name.en}`);

  useNavigation({
    interaction,
    pages: [
      mainPage(PageKey.MAIN, interaction.locale),
      attributesPage(PageKey.ATTRIBUTES, interaction.locale),
      fittingPage(PageKey.FITTING, interaction.locale),
      skillsPage(PageKey.SKILLS, interaction.locale),
      industryPage(PageKey.INDUSTRY, interaction.locale),
    ],
    key: 'main',
    context: { type, interaction },
    updateContext: async (key: string, context: TypeContext) => {
      return Promise.resolve(key);
    },
  });
}
