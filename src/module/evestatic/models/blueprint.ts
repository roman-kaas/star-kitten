import jsonData from '$data/reference-data/blueprints.json';
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

export class Blueprint {
  public readonly blueprint_type_id: number;
  public readonly max_production_limit: number;
  public readonly activities: {
    [ActivityType.MANUFACTURING]?: ManufacturingActivity;
    [ActivityType.RESEARCH_MATERIAL]?: Activity;
    [ActivityType.RESEARCH_TIME]?: Activity;
    [ActivityType.COPYING]?: Activity;
    [ActivityType.INVENTION]?: InventionActivity;
  };

  constructor(blueprint_type_id: number) {
    const data = blueprintData[blueprint_type_id];
    if (!data) throw new Error(`Blueprint Type ID ${blueprint_type_id} not found in reference data`);
    this.blueprint_type_id = blueprint_type_id;
    this.max_production_limit = data.max_production_limit;
    this.activities = data.activities;
  }

  public get type(): Type {
    return getType(this.blueprint_type_id);
  }

  public get manufacturing_materials(): TypeQuantity[] {
    const manufacturing = this.activities[ActivityType.MANUFACTURING];
    if (!manufacturing) return [];

    return Object.entries(manufacturing.materials).map(([type_id, { quantity }]) => ({
      type: getType(parseInt(type_id)),
      quantity,
    }));
  }

  public get manufacturing_products(): TypeQuantity[] {
    const manufacturing = this.activities[ActivityType.MANUFACTURING];
    if (!manufacturing) return [];

    return Object.entries(manufacturing.products).map(([type_id, { quantity }]) => ({
      type: getType(parseInt(type_id)),
      quantity,
    }));
  }

  public get invention_materials(): TypeQuantity[] {
    const invention = this.activities[ActivityType.INVENTION];
    if (!invention) return [];

    return Object.entries(invention.materials).map(([type_id, { quantity }]) => ({
      type: getType(parseInt(type_id)),
      quantity,
    }));
  }

  public get invention_products(): TypeQuantity[] {
    const invention = this.activities[ActivityType.INVENTION];
    if (!invention) return [];

    return Object.entries(invention.products).map(([type_id, { quantity }]) => ({
      type: getType(parseInt(type_id)),
      quantity,
    }));
  }

  public get invention_skills(): { type: Type; level: number }[] {
    const invention = this.activities[ActivityType.INVENTION];
    if (!invention) return [];

    return Object.entries(invention.skills).map(([skill_type_id, level]) => ({
      type: getType(parseInt(skill_type_id)),
      level,
    }));
  }
}

export const getBlueprint = (blueprint_type_id: number): Blueprint => new Blueprint(blueprint_type_id);
