import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  CommandInteraction,
} from 'discord.js';
import { MarkgetGroupIds, Search } from '../lib/search';
import { useNavigation } from '$discord';
import type { Type } from '../models/type';
import { mainPage, attributesPage, fittingPage, skillsPage, industryPage } from './pages';
import { PageKey } from './ship.command';

export interface TypeContext {
  type: Type;
  interaction: CommandInteraction;
  disabled?: boolean;
}

export const data = new SlashCommandBuilder()
  .setName('type')
  .setDescription('Get information about a type')
  .addStringOption((option) => option.setName('name').setDescription('The type name').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  const deferred = await interaction.deferReply({ ephemeral: true });

  const name = interaction.options.getString('name') ?? '';

  const type = Search.getInstance(MarkgetGroupIds.ALL).searchByName(name);
  if (!type) {
    interaction.editReply({ content: `Type ${name} not found` });
    return;
  }

  // const embed = new EmbedBuilder()
  //   .setDescription(
  //     `Type ID: ${name}\n\n${type.name[interaction.locale] ?? type.name.en}\n\n${type.description[interaction.locale] ?? type.description.en}`,)
  //   .setColor('Green');

  // interaction.reply({ embeds: [embed] });

  const updateContext = async (key: string, context: TypeContext) => {
    return Promise.resolve(key);
  };

  useNavigation({
    interaction: deferred.interaction as any,
    key: 'main',
    pages: [
      mainPage(PageKey.MAIN, interaction.locale),
      attributesPage(PageKey.ATTRIBUTES, interaction.locale),
      fittingPage(PageKey.FITTING, interaction.locale),
      skillsPage(PageKey.SKILLS, interaction.locale),
      industryPage(PageKey.INDUSTRY, interaction.locale),
    ],
    context: { type, interaction },
    updateContext,
  });
}

export const buildButtonRow = (key: string, context: TypeContext) => {
  return [
    { customId: PageKey.MAIN, label: 'Main', style: 'PRIMARY', disabled: key === PageKey.MAIN },
    { customId: PageKey.ATTRIBUTES, label: 'Attributes', style: 'PRIMARY', disabled: key === PageKey.ATTRIBUTES },
    { customId: PageKey.FITTING, label: 'Fitting', style: 'PRIMARY', disabled: key === PageKey.FITTING },
    { customId: PageKey.SKILLS, label: 'Skills', style: 'PRIMARY', disabled: key === PageKey.SKILLS },
    (context.type.blueprints || context.type.schematics) && { customId: PageKey.INDUSTRY, label: 'Industry', style: 'PRIMARY', disabled: key === PageKey.INDUSTRY },
  ];
}
