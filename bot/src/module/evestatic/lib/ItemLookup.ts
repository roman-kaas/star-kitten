import { ButtonStyle, ChatInputCommandInteraction, CommandInteraction, MessageFlags } from 'discord.js';
import { typeSearch } from '../lib/search';
import { createActionRow, useNavigation, type ResumeableInteraction } from '@lib/discord';
import type { Type } from '../../../../../star-kitten-lib/src/eve/models/type';
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
  ephemeral: boolean;
  type: string;
}

export async function itemLookup(interaction: ChatInputCommandInteraction, options: ItemLookupOptions, saveResume: (messageId: string) => void) {
  const deferred = await interaction.deferReply({ flags: options.ephemeral ? MessageFlags.Ephemeral : undefined });
  const name = interaction.options.getString('name') ?? '';

  await lookup(deferred.interaction as any, options, name, interaction.guild?.preferredLocale, saveResume);
}

export async function resumeItemLookup(interaction: ResumeableInteraction, options: ItemLookupOptions, name: string, saveResume: (messageId: string) => void) {
  await lookup(interaction, options, name, interaction.guild?.preferredLocale, saveResume);
}


async function lookup(messageOrInteraction: ResumeableInteraction | ChatInputCommandInteraction, options: ItemLookupOptions, name: string, locale: string, saveResume: (messageId: string) => void) {
  const type = await typeSearch(name);
  if (!type) {
    if (messageOrInteraction instanceof ChatInputCommandInteraction) {
      messageOrInteraction.editReply({ content: `${options.type} ${name} not found` });
    } else {
      messageOrInteraction.message.edit({ content: `${options.type} ${name} not found` });
    }
    return;
  }

  const updateContext = async (key: string, context: TypeContext) => {
    return Promise.resolve(key);
  };

  const buildButtonRow = (key: string, context: TypeContext) => {
    return createActionRow(
      { customId: PageKey.MAIN, label: 'Main', style: ButtonStyle.Primary, disabled: key === PageKey.MAIN },
      context.type.hasAttributes && {
        customId: PageKey.ATTRIBUTES,
        label: 'Attributes',
        style: ButtonStyle.Primary,
        // disabled: key === PageKey.ATTRIBUTES,
      },
      context.type.hasAttributes && {
        customId: PageKey.FITTING,
        label: `Fitting${context.type.variants.length > 0 ? ' | Variants' : ''}`,
        style: ButtonStyle.Primary,
        // disabled: key === PageKey.FITTING,
      },
      context.type.skills.length > 0 && {
        customId: PageKey.SKILLS,
        label: 'Skills',
        style: ButtonStyle.Primary,
        // disabled: key === PageKey.SKILLS,
      },
      (context.type.blueprints.length > 0 || context.type.schematics.length > 0) && {
        customId: PageKey.INDUSTRY,
        label: 'Industry',
        style: ButtonStyle.Primary,
        // disabled: key === PageKey.INDUSTRY,
      },
    );
  };

  useNavigation({
    interaction: messageOrInteraction,
    key: 'main',
    pages: [
      mainPage(PageKey.MAIN, locale),
      attributesPage(PageKey.ATTRIBUTES, locale),
      fittingPage(PageKey.FITTING, locale),
      skillsPage(PageKey.SKILLS, locale),
      industryPage(PageKey.INDUSTRY, locale),
    ],
    context: { type, buildButtonRow, interaction: messageOrInteraction },
    updateContext,
    saveResume,
  });
}
