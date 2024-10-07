import jsonData from '$data/reference-data/categories.json';
import { getGroup, type Group } from './group';
import { getIcon, type Icon } from './icon';
import type { LocalizedString } from './sharedTypes';

export const categoryData: { [category_id: string]: Category } = jsonData as any;

export enum CommonCategory {
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

export class Category {
  public readonly category_id: number;
  public readonly name: LocalizedString;
  public readonly published: boolean;
  public readonly group_ids: number[];
  public readonly icon_id?: number;

  constructor(category_id: number) {
    const data = categoryData[category_id];
    if (!data) throw new Error(`Category ID ${category_id} not found in reference data`);
    this.category_id = category_id;
    this.name = data.name;
    this.published = data.published;
    this.group_ids = data.group_ids;
    this.icon_id = data.icon_id;
  }

  public get groups(): Group[] {
    return this.group_ids.map((group_id) => getGroup(group_id));
  }

  public get icon(): Icon {
    return getIcon(this.icon_id);
  }
}

export const getCategory = (category_id: number): Category => new Category(category_id);
