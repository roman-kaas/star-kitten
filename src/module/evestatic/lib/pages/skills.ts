import { coloredText, renderThreeColumns, WHITE_SPACE, type Page } from "$discord";
import { EmbedBuilder } from "discord.js";
import type { Type } from "$module/evestatic/models/type";
import { db } from "$module/auth";
import { esi } from "$eve";
import { CommonCategory } from "$module/evestatic/models/category";
import type { PageKey, TypeContext } from "../ItemLookup";

function canUseText(type: Type) {
  const category = type.group.category.category_id;
  switch (category) {
    case CommonCategory.SHIP:
      return 'fly this ship';
    case CommonCategory.DRONE:
      return 'use this drone';
    case CommonCategory.MODULE:
      return 'use this module';
    default: return 'use this item';
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
          embeds: [new EmbedBuilder()
            .setTitle(type.name[locale] ?? type.name.en)
            .setDescription('This item does not require any skills to use.')
            .setThumbnail(type.iconUrl)
            .setURL(type.eveRefLink)
            .setFooter({ text: `id: ${type.type_id}` })
            .setColor('Green')],
          components: [context.buildButtonRow(key, context)],
        };
      }

      const user = db.getUserByDiscordId(context.interaction.user.id);
      const characterSkills: { [key: number]: number } = user ? (await esi.getCharacterSkills(user.mainCharacter.id, user.mainCharacter.tokens))?.skills.reduce((acc, skill) => ({ ...acc, [skill.skill_id]: skill.trained_skill_level }), {}) : null;

      const embed = new EmbedBuilder()
        .setTitle(type.name[locale] ?? type.name.en)
        .setThumbnail(type.iconUrl)
        .setURL(type.eveRefLink)
        .setFooter({ text: `id: ${type.type_id} -- ▣ = trained | ◼ = required` });

      let description = '';

      description += '### Required Skills\n```\n';
      description += type.skills.map((skillLevel) => `${skillLevel.skill.name[locale] ?? skillLevel.skill.name.en} ${skillLevel.level}`).join('\n');
      description += '```';

      let canFly = true;
      if (characterSkills) {
        if (type.skills.every((skillLevel) => characterSkills[skillLevel.skill.type_id] >= skillLevel.level)) {
          description += coloredText(`${user.mainCharacter.name} can ${canUseText(type)}`, 'green');
          canFly = true;
        } else {
          description += coloredText(`${user.mainCharacter.name} cannot ${canUseText(type)}`, 'red');
          canFly = false;
        }
      }
      embed.setDescription(description);
      embed.addFields(renderThreeColumns('', getSkillNames(type, locale), [], getSkillLevels(type, characterSkills).map(renderLevel)));
      embed.setColor(canFly ? 'Green' : 'Red');
      return {
        type: 'page',
        embeds: [embed],
        components: [context.buildButtonRow(key, context)],
      };
    },
  }
}

function getSkillNames(type: Type, locale: string, depth: number = 0) {
  let spacing = '';
  for (let i = 0; i < depth; ++i) {
    spacing += WHITE_SPACE;
  }
  let names: string[] = [];
  type.skills.forEach((skillLevel) => {
    names.push(`${spacing}[${skillLevel.skill.name[locale] ?? skillLevel.skill.name.en}](${skillLevel.skill.eveRefLink})`);
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
  type.skills.forEach((skillLevel) => {
    levels.push({
      required: skillLevel.level,
      have: skills ? skills[skillLevel.skill.type_id] : 0,
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
    str += i <= level.required ? (level.have >= i ? '▣' : '◼') : (level.have >= i ? '▣' : '▢');
    // shapes to test with:
    // '■' '▰' '▱' '▨' '▧' '◼' '▦' '▩' '▥' '▤' '▣' '▢' '◪' '◫' '◩' '◨' '◧' 
  }
  return str + `${WHITE_SPACE}(${level.required})`;
}
