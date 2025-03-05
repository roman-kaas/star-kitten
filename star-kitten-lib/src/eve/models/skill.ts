import jsonData from '../../../data/reference-data/skills.json';
import { type Attribute, getAttribute } from './attribute';

export const skillData: { [type_id: string]: Skill } = jsonData as any;

export interface Skill {
  readonly type_id: number;
  readonly primary_dogma_attribute_id: number;
  readonly secondary_dogma_attribute_id: number;
  readonly primary_character_attribute_id: number;
  readonly secondary_character_attribute_id: number;
  readonly training_time_multiplier: number;
  readonly required_skills?: { [skill_type_id: string]: number }; // skill_type_id : level
}

export function getSkill(type_id: number) {
  const data = skillData[type_id];
  if (!data) throw new Error(`Skill ID ${type_id} not found in reference data`);
  return data;
}


export function getPrimaryDogmaAttribute(skill: Skill): Attribute {
  return getAttribute(skill.primary_dogma_attribute_id);
}

export function getSecondaryDogmaAttribute(skill: Skill): Attribute {
  return getAttribute(skill.secondary_dogma_attribute_id);
}

export function getPrimaryCharacterAttribute(skill: Skill): Attribute {
  return getAttribute(skill.primary_character_attribute_id);
}

export function getSecondaryCharacterAttribute(skill: Skill): Attribute {
  return getAttribute(skill.secondary_character_attribute_id);
}

export function getPrerequisites(skill: Skill): { skill: Skill; level: number }[] {
  if (!skill.required_skills) return [];
  return Object.entries(skill.required_skills).map(([skill_type_id, level]) => ({
    skill: getSkill(parseInt(skill_type_id)),
    level,
  }));
}

export function skillpointsAtLevel(skill: Skill, level: number): number {
  return Math.pow(2, 2.5 * (level - 1)) * 250 * skill.training_time_multiplier;
}
