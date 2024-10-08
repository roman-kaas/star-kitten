import { type Page } from '$discord';
import { PageKey, type TypeContext } from '../ItemLookup';
import { EmbedBuilder } from 'discord.js';
import { fetchPrice } from '$eve/thirdParty/evetycoon';
import { BREAKING_WHITE_SPACE, WHITE_SPACE } from '$discord/utils/embeds';
import { cleanText, formatNumberToShortForm } from '$discord';

export function mainPage(key: string = PageKey.MAIN, locale: string = 'en'): Page<TypeContext> {
  return {
    key: 'main',
    content: async (context: TypeContext) => {
      const type = context.type;
      const embed = new EmbedBuilder()
        .setTitle(type.name[locale] ?? type.name.en)
        .setThumbnail(type.iconUrl)
        .setURL(type.eveRefLink)
        .setFooter({ text: `id: ${type.type_id}` })
        .setColor('Green');

      const fields = [];

      // Handle Description
      {
        let description = '';
        description += `**Group:** [${type.group.name[locale] ?? type.group.name.en}](${type.group.eveRefLink})`;

        if (type.skillBonuses.length > 0) {
          description += '\n### Skill Bonuses\n';
          description += type.skillBonuses
            .map((bonus) => {
              return `\n\n**[${bonus.skill.name[locale] ?? bonus.skill.name.en}](${bonus.skill.eveRefLink}) bonuses (per skill level)**
        ${bonus.bonuses
          .sort((a, b) => a.importance - b.importance)
          .map(
            (b) => `**${b.bonus}${b.unit?.display_name ?? '-'}** ${cleanText(b.bonus_text[locale] ?? b.bonus_text.en)}`,
          )
          .join('\n')}`;
            })
            .join('\n');
        }

        if (type.roleBonuses.length > 0) {
          description += '\n### Role Bonuses\n';
          description += type.roleBonuses
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
        const price = await fetchPrice(type.type_id);

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
              value: `*[View on EVE Tycoon](${type.eveTycoonLink})*`,
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
