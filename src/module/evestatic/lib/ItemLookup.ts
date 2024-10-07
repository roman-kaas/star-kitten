import {
  ButtonStyle,
  ChatInputCommandInteraction,
  CommandInteraction,
} from 'discord.js';
import { MarkgetGroupIds, Search } from '../lib/search';
import { createActionRow, useNavigation } from '$discord';
import type { Type } from '../models/type';
import { mainPage, attributesPage, fittingPage, skillsPage, industryPage } from './pages';


export enum PageKey {
  MAIN = 'main',
  ATTRIBUTES = 'attributes',
  FITTING = 'fitting',
  SKILLS = 'skills',
  INDUSTRY = 'industry',
}

export interface TypeContext {
  type: Type;
  interaction: CommandInteraction;
  disabled?: boolean;
  buildButtonRow: (key: string, context: TypeContext) => any[];
}

export interface ItemLookupOptions {
  category: MarkgetGroupIds;
  ephemeral: boolean;
  type: string;
}

export async function itemLookup(interaction: ChatInputCommandInteraction, options: ItemLookupOptions) {
  const deferred = await interaction.deferReply({ ephemeral: options.ephemeral });
  const name = interaction.options.getString('name') ?? '';

  const type = Search.getInstance(options.category).searchByName(name);
  if (!type) {
    interaction.editReply({ content: `${options.type} ${name} not found` });
    return;
  }

  const updateContext = async (key: string, context: TypeContext) => {
    return Promise.resolve(key);
  };

  const buildButtonRow = (key: string, context: TypeContext) => {
    return createActionRow(
      { customId: PageKey.MAIN, label: 'Main', style: ButtonStyle.Primary, disabled: key === PageKey.MAIN },
      { customId: PageKey.ATTRIBUTES, label: 'Attributes', style: ButtonStyle.Primary, disabled: key === PageKey.ATTRIBUTES },
      { customId: PageKey.FITTING, label: `Fitting${context.type.variants.length > 0 ? ' | Variants' : ''}`, style: ButtonStyle.Primary, disabled: key === PageKey.FITTING },
      context.type.skills.length > 0 && { customId: PageKey.SKILLS, label: 'Skills', style: ButtonStyle.Primary, disabled: key === PageKey.SKILLS },
      (context.type.blueprints.length > 0 || context.type.schematics.length > 0) && { customId: PageKey.INDUSTRY, label: 'Industry', style: ButtonStyle.Primary, disabled: key === PageKey.INDUSTRY },
    );
  }

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
    context: { type, interaction, buildButtonRow },
    updateContext,
  });
}

