import jsonData from '../../../data/reference-data/dogma_effects.json';
import { getAttribute } from './attribute';
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

export interface Effect {
  readonly effect_id: number;
  readonly disallow_auto_repeat: boolean;
  readonly discharge_attribute_id?: number;
  readonly distribution?: number;
  readonly duration_attribute_id?: number;
  readonly effect_category: number;
  readonly effect_name: string;
  readonly electronic_chance: boolean;
  readonly falloff_attribute_id?: number;
  readonly guid: string;
  readonly is_assistance: boolean;
  readonly is_offensive: boolean;
  readonly is_warp_safe: boolean;
  readonly propulsion_chance: boolean;
  readonly published: boolean;
  readonly range_attribute_id?: number;
  readonly range_chance: boolean;
  readonly modifiers: Modifier[];
  readonly tracking_speed_attribute_id?: number;
  readonly description: LocalizedString;
  readonly display_name: LocalizedString;
  readonly name: string;
}

export function getEffect(effect_id: number): Effect {
  const data = effectData[effect_id];
  if (!data) throw new Error(`Effect ID ${effect_id} not found in reference data`);
  return data;
}

export function getDischargeAttribute(effect: Effect) {
  return effect.discharge_attribute_id && getAttribute(effect.discharge_attribute_id);
}

export function getFalloffAttribute(effect: Effect) {
  return effect.falloff_attribute_id && getAttribute(effect.falloff_attribute_id);
}

export function getDurationAttribute(effect: Effect) {
  return effect.duration_attribute_id && getAttribute(effect.duration_attribute_id);
}

export function getRangeAttribute(effect: Effect) {
  return effect.range_attribute_id && getAttribute(effect.range_attribute_id);
}

export function getTrackingSpeedAttribute(effect: Effect) {
  return effect.tracking_speed_attribute_id && getAttribute(effect.tracking_speed_attribute_id);
}
