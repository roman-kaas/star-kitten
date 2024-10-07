import { EmbedBuilder, type CommandInteraction } from 'discord.js';
import { getType, Type } from '../models/type';
import { fetchPrice } from '$eve/thirdParty/evetycoon';
import { BREAKING_WHITE_SPACE } from '$discord/utils/embeds';
import { cleanText, formatNumberToShortForm } from '$discord';
import { CommonCategory } from '../models/category';

export async function buildTypeEmbed(type: Type, locale: string = 'en') {
  const embed = new EmbedBuilder();
  embed.setTitle(type.name[locale] ?? type.name.en);
  embed.setThumbnail(type.iconUrl);
  embed.setURL(type.eveRefLink);
  embed.setFooter({ text: `id: ${type.type_id}` });

  const fields = [];

  let description = '';
  description += `**Group:** [${type.group.name[locale] ?? type.group.name.en}](${type.group.eveRefLink})`;

  if (type.skillBonuses.length > 0) {
    description += '\n### Skill Bonuses\n';
    description += type.skillBonuses
      .map((bonus) => {
        return `\n\n**[${bonus.skill.name[locale] ?? bonus.skill.name.en}](${bonus.skill.eveRefLink}) bonuses (per skill level)**
      ${bonus.bonuses.sort((a, b) => a.importance - b.importance).map((b) => `**${b.bonus}${b.unit?.display_name ?? '-'}** ${cleanText(b.bonus_text[locale] ?? b.bonus_text.en)}`).join('\n')}`;
      })
      .join('\n');
  }

  if (type.roleBonuses.length > 0) {
    description += '\n### Role Bonuses\n';
    description += type.roleBonuses
      .sort((a, b) => a.importance - b.importance)
      .map((b) => `**${b.bonus ?? ''}${b.unit?.display_name ?? '-'}** ${cleanText(b.bonus_text[locale] ?? b.bonus_text.en)}`)
      .join('\n');
  }

  // --- FIELDS ---

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

  if (type.group.category_id !== CommonCategory.SHIP) {
    fields.push({
      name: 'Description',
      value: cleanText(type.description[locale] ?? type.description.en),
    })
  }

  embed.setDescription(cleanText(description));
  embed.addFields(fields);
  embed.setColor('Green');

  return embed;
}
