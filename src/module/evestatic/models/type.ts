import jsonData from '$data/reference-data/types.json';
import type {
  ActivityType,
  AttributeIDValue,
  BlueprintTypeIDActivity,
  EffectIDDefault,
  LocalizedString,
  MaterialIDQuantity,
} from './sharedTypes';
import { IconSize } from './icon';
import { getUnit, type Unit } from './unit';
import { type Attribute, CommonAttribute, getAttribute } from './attribute';
import { getGroup } from './group';

export const typeData: { [type_id: string]: Type } = jsonData as any;

interface Masteries {
  '0': number[];
  '1': number[];
  '2': number[];
  '3': number[];
  '4': number[];
}

interface Bonus {
  bonus: number;
  bonus_text: LocalizedString;
  importance: number;
  unit_id: number;
}

interface Traits {
  misc_bonuses: { [level: string]: Bonus };
  role_bonuses: { [level: string]: Bonus };
  types: { [skill_type_id: string]: { [order: string]: Bonus } };
}

export class Type {
  public readonly type_id: number;
  public readonly name: LocalizedString;
  public readonly description: LocalizedString;
  public readonly published: boolean;

  public readonly group_id?: number;
  public readonly base_price?: number;
  public readonly capacity?: number;
  public readonly faction_id?: number;
  public readonly graphic_id?: number;
  public readonly market_group_id?: number;
  public readonly mass?: number;
  public readonly masteries?: Masteries;
  public readonly meta_group_id?: number;
  public readonly portion_size?: number;
  public readonly race_id?: number;
  public readonly radius?: number;
  public readonly sof_faction_name?: string;
  public readonly sound_id?: number;
  public readonly traits?: Traits;
  public readonly volume?: number;
  public readonly dogma_attributes?: {
    [attribute_id: string]: AttributeIDValue;
  };
  public readonly dogma_effects?: { [effect_id: string]: EffectIDDefault };
  public readonly packaged_volume?: number;
  public readonly type_materials?: { [type_id: string]: MaterialIDQuantity };
  public readonly required_skills?: { [skill_type_id: string]: number }; // skill_type_id : level
  public readonly type_variations?: { [variant: string]: number }; // variant : type_id
  public readonly produced_by_blueprints?: {
    [blueprint_type_id: string]: BlueprintTypeIDActivity;
  }; // blueprint_type_id : blueprint_activity
  public readonly buildable_pin_type_ids?: number[];
  public readonly is_ore?: boolean;
  public readonly ore_variations?: { [variant: string]: number }; // variant : type_id
  public readonly produced_by_schematic_ids?: number[];
  public readonly used_by_schematic_ids?: number[];
  public readonly is_blueprint?: boolean;

  constructor(type_id: number) {
    const data = typeData[type_id];
    if (!data) throw new Error(`Type ID ${type_id} not found in reference data`);
    this.type_id = type_id;
    this.name = data.name;
    this.description = data.description;
    this.published = data.published;

    this.group_id = data.group_id;
    this.base_price = data.base_price;
    this.capacity = data.capacity;
    this.faction_id = data.faction_id;
    this.graphic_id = data.graphic_id;
    this.market_group_id = data.market_group_id;
    this.mass = data.mass;
    this.masteries = data.masteries;
    this.meta_group_id = data.meta_group_id;
    this.portion_size = data.portion_size;
    this.race_id = data.race_id;
    this.radius = data.radius;
    this.sof_faction_name = data.sof_faction_name;
    this.sound_id = data.sound_id;
    this.traits = data.traits;
    this.volume = data.volume;
    this.dogma_attributes = data.dogma_attributes;
    this.dogma_effects = data.dogma_effects;
    this.packaged_volume = data.packaged_volume;
    this.type_materials = data.type_materials;
    this.required_skills = data.required_skills;
    this.type_variations = data.type_variations;
    this.produced_by_blueprints = data.produced_by_blueprints;
    this.buildable_pin_type_ids = data.buildable_pin_type_ids;
    this.is_ore = data.is_ore;
    this.ore_variations = data.ore_variations;
    this.produced_by_schematic_ids = data.produced_by_schematic_ids;
    this.used_by_schematic_ids = data.used_by_schematic_ids;
  }

  getIconUrl(size: IconSize = IconSize.SIZE_64) {
    return `https://images.evetech.net/types/${this.type_id}/icon${this.is_blueprint ? '/bp' : ''}?size=${size}`;
  }

  get iconUrl() {
    return this.getIconUrl();
  }

  get skillBonuses(): {
    skill: Type;
    bonuses: {
      bonus: number;
      bonus_text: LocalizedString;
      importance: number;
      unit: Unit;
    }[];
  }[] {
    if (!this.traits) return [];
    const skillBonuses: {
      skill: Type;
      bonuses: {
        bonus: number;
        bonus_text: LocalizedString;
        importance: number;
        unit: Unit;
      }[];
    }[] = [];
    for (const skill_type_id in this.traits.types) {
      const bonuses = [];
      for (const order in this.traits.types[skill_type_id]) {
        const bonus = this.traits.types[skill_type_id][order];
        bonuses.push({
          bonus: bonus.bonus,
          bonus_text: bonus.bonus_text,
          importance: bonus.importance,
          unit: getUnit(bonus.unit_id),
        });
      }
      skillBonuses.push({
        skill: getType(Number(skill_type_id)),
        bonuses,
      });
    }
    return skillBonuses;
  }

  get roleBonuses() {
    if (!this.traits) return [];
    const bonuses = [];
    for (const bonus of Object.values(this.traits.role_bonuses)) {
      bonuses.push({
        bonus: bonus.bonus,
        bonus_text: bonus.bonus_text,
        importance: bonus.importance,
        unit: bonus.unit_id && getUnit(bonus.unit_id),
      });
    }
    return bonuses;
  }

  get eveRefLink() {
    return `https://everef.net/types/${this.type_id}`;
  }

  get eveTycoonLink() {
    return `https://evetycoon.com/market/${this.type_id}`;
  }

  get attributes(): { attribute: Attribute; value: number }[] {
    const attributes = [];
    for (const attribute_id in this.dogma_attributes) {
      attributes.push({
        attribute: getAttribute(Number(attribute_id)),
        value: this.dogma_attributes[attribute_id].value,
      });
    }
    return attributes;
  }

  hasAnyAttribute(attribute_ids: CommonAttribute[]) {
    for (const attribute_id of attribute_ids) {
      if (this.dogma_attributes[attribute_id]) return true;
    }
    return false;
  }

  get skills(): { skill: Type; level: number }[] {
    const skills = [];
    for (const skill_type_id in this.required_skills) {
      skills.push({
        skill: getType(Number(skill_type_id)),
        level: this.required_skills[skill_type_id],
      });
    }
    return skills;
  }

  getAttribute(attribute_id: number) {
    if (!this.dogma_attributes[attribute_id]) return null;
    return {
      attribute: getAttribute(attribute_id),
      value: this.dogma_attributes[attribute_id].value,
    };
  }

  renderEveRefLink(locale: string = 'en') {
    return `[${this.name[locale] ?? this.name.en}](${this.eveRefLink})`;
  }

  get blueprints(): { blueprint: Type; activity: ActivityType }[] {
    if (!this.produced_by_blueprints) return [];
    return Object.values(this.produced_by_blueprints).map((blueprint) => ({
      blueprint: getType(blueprint.blueprint_type_id),
      activity: blueprint.blueprint_activity,
    }));
  }

  get schematics() {
    return this.produced_by_schematic_ids?.map((schematic_id) => getType(schematic_id)) ?? [];
  }

  get group() {
    return getGroup(this.group_id);
  }
}

export const getType = (type_id: number): Type => new Type(type_id);
