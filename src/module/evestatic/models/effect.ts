import jsonData from '$data/reference-data/dogma_effects.json';
import { type Attribute, getAttribute } from './attribute';
import type { LocalizedString } from './sharedTypes';

export const effectData: { [effect_id: string]: Effect } = jsonData as any;

interface Modifier {
  domain: number;
  func: number;
  group_id?: number;
  modified_attribute_id: number;
  modifying_attribute_id: number;
  skill_type_id?: number;
  operator: number;
}

export class Effect {
  public readonly effect_id: number;
  public readonly disallow_auto_repeat: boolean;
  public readonly discharge_attribute_id?: number;
  public readonly distribution?: number;
  public readonly duration_attribute_id?: number;
  public readonly effect_category: number;
  public readonly effect_name: string;
  public readonly electronic_chance: boolean;
  public readonly falloff_attribute_id?: number;
  public readonly guid: string;
  public readonly is_assistance: boolean;
  public readonly is_offensive: boolean;
  public readonly is_warp_safe: boolean;
  public readonly propulsion_chance: boolean;
  public readonly published: boolean;
  public readonly range_attribute_id?: number;
  public readonly range_chance: boolean;
  public readonly modifiers: Modifier[];
  public readonly tracking_speed_attribute_id?: number;
  public readonly description: LocalizedString;
  public readonly display_name: LocalizedString;
  public readonly name: string;

  constructor(effect_id: number) {
    const data = effectData[effect_id];
    if (!data) throw new Error(`Effect ID ${effect_id} not found in reference data`);
    this.effect_id = effect_id;
    this.disallow_auto_repeat = data.disallow_auto_repeat;
    this.discharge_attribute_id = data.discharge_attribute_id;
    this.distribution = data.distribution;
    this.duration_attribute_id = data.duration_attribute_id;
    this.effect_category = data.effect_category;
    this.effect_name = data.effect_name;
    this.electronic_chance = data.electronic_chance;
    this.falloff_attribute_id = data.falloff_attribute_id;
    this.guid = data.guid;
    this.is_assistance = data.is_assistance;
    this.is_offensive = data.is_offensive;
    this.is_warp_safe = data.is_warp_safe;
    this.propulsion_chance = data.propulsion_chance;
    this.published = data.published;
    this.range_attribute_id = data.range_attribute_id;
    this.range_chance = data.range_chance;
    this.modifiers = data.modifiers;
    this.tracking_speed_attribute_id = data.tracking_speed_attribute_id;
    this.description = data.description;
    this.display_name = data.display_name;
    this.name = data.name;
  }

  public get discharge_attribute(): Attribute | undefined {
    return this.discharge_attribute_id && getAttribute(this.discharge_attribute_id);
  }

  public get falloff_attribute(): Attribute | undefined {
    return this.falloff_attribute_id && getAttribute(this.falloff_attribute_id);
  }

  public get duration_attribute(): Attribute | undefined {
    return this.duration_attribute_id && getAttribute(this.duration_attribute_id);
  }

  public get range_attribute(): Attribute | undefined {
    return this.range_attribute_id && getAttribute(this.range_attribute_id);
  }

  public get tracking_speed_attribute(): Attribute | undefined {
    return this.tracking_speed_attribute_id && getAttribute(this.tracking_speed_attribute_id);
  }
}

export const getEffect = (effect_id: number): Effect => new Effect(effect_id);
