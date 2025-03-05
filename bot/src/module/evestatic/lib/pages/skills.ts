import { coloredText, renderThreeColumns, WHITE_SPACE, type Page } from '@lib/discord';
import { EmbedBuilder } from 'discord.js';
import type { Type } from 'star-kitten-lib/eve';
import { eveRefLink, getCharacterSkills, getGroup, getTypeIconUrl, getTypeSkills } from 'star-kitten-lib/eve';
import { CommonCategory } from 'star-kitten-lib/eve';
import type { PageKey, TypeContext } from '../ItemLookup';
import { CharacterHelper, UserHelper } from 'star-kitten-lib/db';

function canUseText(type: Type) {
  const category = getGroup(type.group_id).category_id;
  switch (category) {
    case CommonCategory.SHIP:
      return 'fly this ship';
    case CommonCategory.DRONE:
      return 'use this drone';
    case CommonCategory.MODULE:
      return 'use this module';
    default:
      return 'use this item';
  }
}

export function skillsPage(key: PageKey.SKILLS, locale: string = 'en'): Page<TypeContext> {
  return {
    key: 'skills',
    content: async (context: TypeContext) => {
      const type = context.type;

      if (!type.required_skills || type.required_skills.length === 0) {
        return {
          type: 'page',
          embeds: [
            new EmbedBuilder()
              .setTitle(type.name[locale] ?? type.name.en)
              .setDescription('This item does not require any skills to use.')
              .setThumbnail(getTypeIconUrl(type))
              .setURL(eveRefLink(type.type_id))
              .setFooter({ text: `id: ${type.type_id}` })
              .setColor('Green'),
          ],
          components: [context.buildButtonRow(key, context)],
        };
      }

      const user = UserHelper.findByDiscordId(context.interaction.user.id);
      const main = CharacterHelper.find(user.mainCharacterID);
      const skills = main && await getCharacterSkills(main);
      const characterSkills: { [key: number]: number } = skills && (skills)?.skills.reduce(
        (acc, skill) => ({ ...acc, [skill.skill_id]: skill.trained_skill_level }),
        {},
      );

      const embed = new EmbedBuilder()
        .setTitle(type.name[locale] ?? type.name.en)
        .setThumbnail(getTypeIconUrl(type))
        .setURL(eveRefLink(type.type_id))
        .setFooter({ text: `id: ${type.type_id} -- ◼ = trained | ☒ = required but not trained` });

      let description = '';

      description += '### Required Skills\n```\n';
      description += getTypeSkills(type)
        .map((skillLevel) => `${skillLevel.skill.name[locale] ?? skillLevel.skill.name.en} ${skillLevel.level}`)
        .join('\n');
      description += '```';

      let canFly = true;
      if (characterSkills) {
        if (getTypeSkills(type).every((skillLevel) => characterSkills[skillLevel.skill.type_id] >= skillLevel.level)) {
          description += coloredText(`${main.name} can ${canUseText(type)}`, 'green');
          canFly = true;
        } else {
          description += coloredText(`${main.name} cannot ${canUseText(type)}`, 'red');
          canFly = false;
        }
      }
      embed.setDescription(description);
      embed.addFields(
        renderThreeColumns('', getSkillNames(type, locale), [], getSkillLevels(type, characterSkills).map(renderLevel)),
      );
      embed.setColor(canFly ? 'Green' : 'Red');
      return {
        type: 'page',
        embeds: [embed],
        components: [context.buildButtonRow(key, context)],
      };
    },
  };
}

function getSkillNames(type: Type, locale: string, depth: number = 0) {
  let spacing = '';
  for (let i = 0; i < depth; ++i) {
    spacing += WHITE_SPACE;
  }
  let names: string[] = [];
  getTypeSkills(type).forEach((skillLevel) => {
    names.push(
      `${spacing}[${skillLevel.skill.name[locale] ?? skillLevel.skill.name.en}](${skillLevel.skill.eveRefLink})`,
    );
    if (skillLevel.skill.skills.length > 0) {
      names.push(...getSkillNames(skillLevel.skill, locale, depth + 1));
    }
  });
  return names;
}

interface RequiredLevel {
  required: number;
  have: number;
}

// skills is a map of skill_id to trained_skill_level
function getSkillLevels(type: Type, skills?: { [key: number]: number }): RequiredLevel[] {
  let levels: RequiredLevel[] = [];
  getTypeSkills(type).forEach((skillLevel) => {
    levels.push({
      required: skillLevel.level,
      have: skills ? skills[skillLevel.skill.type_id] || 0 : 0,
    });
    if (skillLevel.skill.skills.length > 0) {
      levels.push(...getSkillLevels(skillLevel.skill, skills));
    }
  });
  return levels;
}

function renderLevel(level: RequiredLevel) {
  let str = '';
  for (let i = 1; i <= 5; ++i) {
    str += i <= level.required ? (level.have >= i ? '◼' : '☒') : level.have >= i ? '◼' : '▢';
    // shapes to test with:
    // '■' '▰' '▱' '▨' '▧' '◼' '▦' '▩' '▥' '▤' '▣' '▢' '◪' '◫' '◩' '◨' '◧'
  }
  return str + `${WHITE_SPACE}${level.have}/${level.required}`;
}
