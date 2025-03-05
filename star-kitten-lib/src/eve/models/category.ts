import jsonData from '../../../data/reference-data/categories.json';
import type { LocalizedString } from './sharedTypes';

export const categoryData: { [category_id: string]: Category } = jsonData as any;

export enum CommonCategory {
  CARGO = 5,
  SHIP = 6,
  MODULE = 7,
  CHARGE = 8,
  BLUEPRINT = 9,
  SKILL = 16,
  DRONE = 18,
  IMPLANT = 20,
  APPAREL = 30,
  DEPLOYABLE = 22,
  REACTION = 24,
  SUBSYSTEM = 32,
  STRUCTURE = 65,
  STRUCTURE_MODULE = 66,
  FIGHTER = 87,
}

export interface Category {
  readonly category_id: number;
  readonly name: LocalizedString;
  readonly published: boolean;
  readonly group_ids: number[];
  readonly icon_id?: number;
}

export function getCategory(category_id: number) {
  const data = categoryData[category_id];
  if (!data) throw new Error(`Category ID ${category_id} not found in reference data`);
  return data;
}

