import jsonData from '../../../data/reference-data/types.json';
import type {
  AttributeIDValue,
  BlueprintTypeIDActivity,
  EffectIDDefault,
  LocalizedString,
  MaterialIDQuantity,
} from './sharedTypes';
import { IconSize } from './icon';
import { getUnit, type Unit } from './unit';
import { CommonAttribute, getAttribute } from './attribute';
import { getGroup } from './group';
import { getMetaGroup } from './metaGroup';

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

export interface Type {
  readonly type_id: number;
  readonly name: LocalizedString;
  readonly description: LocalizedString;
  readonly published: boolean;
  readonly group_id?: number;
  readonly base_price?: number;
  readonly capacity?: number;
  readonly faction_id?: number;
  readonly graphic_id?: number;
  readonly market_group_id?: number;
  readonly mass?: number;
  readonly masteries?: Masteries;
  readonly meta_group_id?: number;
  readonly portion_size?: number;
  readonly race_id?: number;
  readonly radius?: number;
  readonly sof_faction_name?: string;
  readonly sound_id?: number;
  readonly traits?: Traits;
  readonly volume?: number;
  readonly dogma_attributes?: {
    [attribute_id: string]: AttributeIDValue;
  };
  readonly dogma_effects?: { [effect_id: string]: EffectIDDefault };
  readonly packaged_volume?: number;
  readonly type_materials?: { [type_id: string]: MaterialIDQuantity };
  readonly required_skills?: { [skill_type_id: string]: number }; // skill_type_id : level
  readonly type_variations?: { [meta_group_id: string]: number[] }; // meta_group_id : type_ids[]
  readonly produced_by_blueprints?: {
    [blueprint_type_id: string]: BlueprintTypeIDActivity;
  }; // blueprint_type_id : blueprint_activity
  readonly buildable_pin_type_ids?: number[];
  readonly is_ore?: boolean;
  readonly ore_variations?: { [variant: string]: number }; // variant : type_id
  readonly produced_by_schematic_ids?: number[];
  readonly used_by_schematic_ids?: number[];
  readonly is_blueprint?: boolean;
}

export function getType(type_id: number) {
  const data = typeData[type_id];
  if (!data) throw new Error(`Type ID ${type_id} not found in reference data`);
  return data;
}

export function getTypeIconUrl(type: Type, size: IconSize = IconSize.SIZE_64) {
  return `https://images.evetech.net/types/${type.type_id}/icon${type.is_blueprint ? '/bp' : ''}?size=${size}`;
}

export function getSkillBonuses(type: Type): {
  skill: Type;
  bonuses: {
    bonus: number;
    bonus_text: LocalizedString;
    importance: number;
    unit: Unit;
  }[];
}[] {
  if (!type.traits) return [];
  const skillBonuses: {
    skill: Type;
    bonuses: {
      bonus: number;
      bonus_text: LocalizedString;
      importance: number;
      unit: Unit;
    }[];
  }[] = [];
  for (const skill_type_id in type.traits.types) {
    skillBonuses.push({
      skill: getType(Number(skill_type_id)),
      bonuses: Object.keys(type.traits.types[skill_type_id]).map((order) => {
        const bonus = type.traits!.types[skill_type_id][order];
        return {
          bonus: bonus.bonus,
          bonus_text: bonus.bonus_text,
          importance: bonus.importance,
          unit: getUnit(bonus.unit_id),
        };
      }),
    });
  }
  return skillBonuses;
}

export function getRoleBonuses(type: Type) {
  if (!type.traits || !type.traits.role_bonuses) return [];
  return Object.values(type.traits.role_bonuses).map((bonus) => ({
    bonus: bonus.bonus,
    bonus_text: bonus.bonus_text,
    importance: bonus.importance,
    unit: bonus.unit_id && getUnit(bonus.unit_id),
  }));
}

export function eveRefLink(type_id: number) {
  return `https://everef.net/types/${type_id}`;
}

export function renderTypeEveRefLink(type: Type, locale: string = 'en') {
  return `[${type.name[locale] ?? type.name.en}](${eveRefLink(type.type_id)})`;
}

export function eveTycoonLink(type_id: number) {
  return `https://evetycoon.com/market/${type_id}`;
}

export function getTypeAttributes(type: Type) {
  if (!type.dogma_attributes) return [];
  Object.keys(type.dogma_attributes).map((attribute_id) => ({
    attribute: getAttribute(Number(attribute_id)),
    value: type.dogma_attributes![attribute_id].value,
  }));
}

export function typeHasAnyAttribute(type: Type, attribute_ids: CommonAttribute[]) {
  if (!type.dogma_attributes) return false;
  for (const attribute_id of attribute_ids) {
    if (type.dogma_attributes[attribute_id]) return true;
  }
  return false;
}

export function getTypeSkills(type: Type) {
  if (!type.required_skills) return [];
  Object.keys(type.required_skills).map((skill_type_id) => ({
    skill: getType(Number(skill_type_id)),
    level: type.required_skills![skill_type_id],
  }));
}

export function typeGetAttribute(type: Type, attribute_id: number) {
  if (!type.dogma_attributes || !type.dogma_attributes[attribute_id]) return null;
  return {
    attribute: getAttribute(attribute_id),
    value: type.dogma_attributes[attribute_id].value,
  };
}

export function getTypeBlueprints(type: Type) {
  if (!type.produced_by_blueprints) return [];
  return Object.values(type.produced_by_blueprints).map((blueprint) => ({
    blueprint: getType(blueprint.blueprint_type_id),
    activity: blueprint.blueprint_activity,
  }));
}

export function getTypeSchematics(type: Type) {
  return type.produced_by_schematic_ids?.map((schematic_id) => getType(schematic_id)) ?? [];
}

export function getTypeGroup(type: Type) {
  if (!type.group_id) return null;
  return getGroup(type.group_id);
}

export function getTypeVariants(type: Type) {
  return Object.entries(type.type_variations || {}).map(([meta_group_id, variant_ids]) => ({
    metaGroup: getMetaGroup(Number(meta_group_id)),
    types: variant_ids.map((type_id) => getType(type_id)),
  }));
}

export function typeHasAttributes(type: Type) {
  return type.dogma_attributes && Object.keys(type.dogma_attributes).length > 0;
}

