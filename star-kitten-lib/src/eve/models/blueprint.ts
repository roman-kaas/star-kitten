import jsonData from '../../../data/reference-data/blueprints.json';
import { ActivityType, type TypeIDQuantity } from './sharedTypes';
import type { Type } from './type';
import { getType } from './type';

const blueprintData: { [type_id: string]: Blueprint } = jsonData as any;

export interface Activity {
  time: number;
}

export interface ManufacturingActivity extends Activity {
  time: number;
  materials: { [type_id: string]: TypeIDQuantity };
  products: { [type_id: string]: TypeIDQuantity };
}

export interface InventionActivity extends Activity {
  time: number;
  materials: { [type_id: string]: TypeIDQuantity };
  products: { [type_id: string]: TypeIDQuantity };
  skills: { [skill_type_id: string]: number }; // skill_type_id : level
}

export interface TypeQuantity {
  type: Type;
  quantity: number;
}

export interface Blueprint {
  readonly blueprint_type_id: number;
  readonly max_production_limit: number;
  readonly activities: {
    [ActivityType.MANUFACTURING]?: ManufacturingActivity;
    [ActivityType.RESEARCH_MATERIAL]?: Activity;
    [ActivityType.RESEARCH_TIME]?: Activity;
    [ActivityType.COPYING]?: Activity;
    [ActivityType.INVENTION]?: InventionActivity;
  };
}

export function getBlueprint(blueprint_type_id: number): Blueprint {
  const data = blueprintData[blueprint_type_id];
  if (!data) throw new Error(`Blueprint Type ID ${blueprint_type_id} not found in reference data`);
  return data;
}

export function getManufacturingMaterials(blueprint: Blueprint) {
  const manufacturing = blueprint.activities[ActivityType.MANUFACTURING];
  if (!manufacturing) return [];

  return Object.entries(manufacturing.materials).map(([type_id, { quantity }]) => ({
    type: getType(parseInt(type_id)),
    quantity,
  }));
}

export function getManufacturingProducts(blueprint: Blueprint) {
  const manufacturing = blueprint.activities[ActivityType.MANUFACTURING];
  if (!manufacturing) return [];

  return Object.entries(manufacturing.products).map(([type_id, { quantity }]) => ({
    type: getType(parseInt(type_id)),
    quantity,
  }));
}

export function getInventionMaterials(blueprint: Blueprint) {
  const invention = blueprint.activities[ActivityType.INVENTION];
  if (!invention) return [];

  return Object.entries(invention.materials).map(([type_id, { quantity }]) => ({
    type: getType(parseInt(type_id)),
    quantity,
  }));
}

export function getInventionProducts(blueprint: Blueprint) {
  const invention = blueprint.activities[ActivityType.INVENTION];
  if (!invention) return [];

  return Object.entries(invention.products).map(([type_id, { quantity }]) => ({
    type: getType(parseInt(type_id)),
    quantity,
  }));
}

export function getInventionSkills(blueprint: Blueprint) {
  const invention = blueprint.activities[ActivityType.INVENTION];
  if (!invention) return [];

  return Object.entries(invention.skills).map(([skill_type_id, level]) => ({
    type: getType(parseInt(skill_type_id)),
    level,
  }));
}

