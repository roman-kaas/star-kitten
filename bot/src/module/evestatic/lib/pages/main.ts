import { type Page } from '@lib/discord';
import { PageKey, type TypeContext } from '../ItemLookup';
import { EmbedBuilder } from 'discord.js';
import {
  eveRefLink,
  evetycoon,
  eveTycoonLink,
  getRoleBonuses,
  getSkillBonuses,
  getTypeGroup,
  getTypeIconUrl,
  groupEveRefLink,
} from 'star-kitten-lib/eve';
import { BREAKING_WHITE_SPACE, WHITE_SPACE } from '@lib/discord/utils/embeds';
import { cleanText, formatNumberToShortForm } from '@lib/discord';

export function mainPage(key: string = PageKey.MAIN, locale: string = 'en'): Page<TypeContext> {
  return {
    key: 'main',
    content: async (context: TypeContext) => {
      const type = context.type;
      const embed = new EmbedBuilder()
        .setTitle(type.name[locale] ?? type.name.en)
        .setThumbnail(getTypeIconUrl(type))
        .setURL(eveRefLink(type.type_id))
        .setFooter({ text: `id: ${type.type_id}` })
        .setColor('Green');

      const fields = [];

      // Handle Description
      {
        let description = '';
        const group = getTypeGroup(type);
        description += `**Group:** [${group.name[locale] ?? group.name.en}](${groupEveRefLink(group.group_id)})\n`;

        const skillBonuses = getSkillBonuses(type);
        if (skillBonuses.length > 0) {
          description += '\n### Skill Bonuses\n';
          description += skillBonuses
            .map((bonus) => {
              return `\n\n**[${bonus.skill.name[locale] ?? bonus.skill.name.en}](${eveRefLink(bonus.skill.type_id)}) bonuses (per skill level)**
        ${bonus.bonuses
                  .sort((a, b) => a.importance - b.importance)
                  .map(
                    (b) => `**${b.bonus}${b.unit?.display_name ?? '-'}** ${cleanText(b.bonus_text[locale] ?? b.bonus_text.en)}`,
                  )
                  .join('\n')}`;
            })
            .join('\n');
        }

        const roleBonuses = getRoleBonuses(type);
        if (roleBonuses.length > 0) {
          description += '\n### Role Bonuses\n';
          description += roleBonuses
            .sort((a, b) => a.importance - b.importance)
            .map(
              (b) =>
                `**${b.bonus ?? ''}${b.unit?.display_name ?? '-'}** ${cleanText(b.bonus_text[locale] ?? b.bonus_text.en)}`,
            )
            .join('\n');
        }
        embed.setDescription(cleanText(description));
      }

      // --- FIELDS ---

      // handle prices
      {
        const price = await evetycoon.fetchPrice(type.type_id);

        if (price) {
          fields.push(
            {
              name: 'Jita Price',
              value: `**sell** ${formatNumberToShortForm(price.sellAvgFivePercent)}`,
              inline: true,
            },
            {
              name: BREAKING_WHITE_SPACE,
              value: `**buy** ${formatNumberToShortForm(price.buyAvgFivePercent)}`,
              inline: true,
            },
            {
              name: BREAKING_WHITE_SPACE,
              value: `*[View on EVE Tycoon](${eveTycoonLink(type.type_id)})*`,
              inline: true,
            },
          );
        }
      }

      // handle type description
      {
        let typeDescription = type.description[locale] ?? type.description.en;
        typeDescription.split('\n').forEach((line, i) => {
          line = line.trim();
          if (line === '') return;
          fields.push({
            name: i == 0 ? 'Description' : WHITE_SPACE,
            value: cleanText(line),
          });
        });
      }

      embed.addFields(fields);

      return {
        type: 'page',
        embeds: [embed],
        components: [context.buildButtonRow(key, context)],
      };
    },
  };
}
