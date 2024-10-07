import jsonData from '$data/reference-data/schematics.json';
import type { LocalizedString, TypeIDQuantity, TypeQuantity } from './sharedTypes';
import { getType, type Type } from './type';

const schematicData: { [schematic_id: string]: Schematic } = jsonData as any;

export class Schematic {
  public readonly schematic_id: number;
  public readonly cycle_time: number;
  public readonly name: LocalizedString;
  public readonly materials: { [type_id: string]: TypeIDQuantity };
  public readonly products: { [type_id: string]: TypeIDQuantity };
  public readonly pin_type_ids: number[];

  constructor(schematic_id: number) {
    const data = schematicData[schematic_id];
    if (!data) throw new Error(`Schematic ID ${schematic_id} not found in reference data`);
    this.schematic_id = schematic_id;
  }

  public get type(): Type {
    return getType(this.schematic_id);
  }

  public get material_quantities(): TypeQuantity[] {
    return Object.entries(this.materials).map(([type_id, { quantity }]) => ({
      type: getType(Number(type_id)),
      quantity,
    }));
  }

  public get product_quantities(): TypeQuantity[] {
    return Object.entries(this.products).map(([type_id, { quantity }]) => ({
      type: getType(Number(type_id)),
      quantity,
    }));
  }

  public get pin_types(): Type[] {
    return this.pin_type_ids.map(getType);
  }
}

export const getSchematic = (schematic_id: number): Schematic => new Schematic(schematic_id);
