import jsonData from '$data/reference-data/skills.json';
import { type Attribute, getAttribute } from './attribute';
import { getType, type Type } from './type';

export const skillData: { [type_id: string]: Skill } = jsonData as any;

export class Skill {
  public readonly type_id: number;
  public readonly primary_dogma_attribute_id: number;
  public readonly secondary_dogma_attribute_id: number;
  public readonly primary_character_attribute_id: number;
  public readonly secondary_character_attribute_id: number;
  public readonly training_time_multiplier: number;
  public readonly required_skills?: { [skill_type_id: string]: number }; // skill_type_id : level

  constructor(type_id: number) {
    const data = skillData[type_id];
    if (!data) throw new Error(`Skill Type ID ${type_id} not found in reference data`);
    this.type_id = type_id;
    this.primary_dogma_attribute_id = data.primary_dogma_attribute_id;
    this.secondary_dogma_attribute_id = data.secondary_dogma_attribute_id;
    this.primary_character_attribute_id = data.primary_character_attribute_id;
    this.secondary_character_attribute_id = data.secondary_character_attribute_id;
    this.training_time_multiplier = data.training_time_multiplier;
    this.required_skills = data.required_skills;
  }

  public get type(): Type {
    return getType(this.type_id);
  }

  public get primary_dogma_attribute(): Attribute {
    return getAttribute(this.primary_dogma_attribute_id);
  }

  public get secondary__dogma_attribute(): Attribute {
    return getAttribute(this.secondary_dogma_attribute_id);
  }

  public get primary_character_attribute(): Attribute {
    return getAttribute(this.primary_character_attribute_id);
  }

  public get secondary_character_attribute(): Attribute {
    return getAttribute(this.secondary_character_attribute_id);
  }

  public get prerequisites(): { skill: Skill; level: number }[] {
    return Object.entries(this.required_skills).map(([skill_type_id, level]) => ({
      skill: new Skill(parseInt(skill_type_id)),
      level,
    }));
  }

  public skillpoints_at_level(level: number): number {
    return Math.pow(2, 2.5 * (level - 1)) * 250 * this.training_time_multiplier;
  }
}

export const getSkill = (type_id: number): Skill => new Skill(type_id);
