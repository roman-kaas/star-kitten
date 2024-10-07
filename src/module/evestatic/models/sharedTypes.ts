import type { Type } from './type';

export interface LocalizedString {
  de?: string;
  en?: string;
  es?: string;
  fr?: string;
  ja?: string;
  ko?: string;
  ru?: string;
  zh?: string;
}

export interface TypeIDQuantity {
  type_id: number;
  quantity: number;
}

export interface TypeQuantity {
  type: Type;
  quantity: number;
}

export interface AttributeIDValue {
  attribute_id: number;
  value: number;
}

export interface EffectIDDefault {
  effect_id: number;
  is_default: boolean;
}

export interface MaterialIDQuantity {
  material_type_id: number;
  quantity: number;
}

export interface BlueprintTypeIDActivity {
  blueprint_type_id: number;
  blueprint_activity: ActivityType;
}

export enum ActivityType {
  MANUFACTURING = 'manufacturing',
  RESEARCH_MATERIAL = 'research_material',
  RESEARCH_TIME = 'research_time',
  COPYING = 'copying',
  INVENTION = 'invention',
}

export interface Position {
  x: number;
  y: number;
  z: number;
}
