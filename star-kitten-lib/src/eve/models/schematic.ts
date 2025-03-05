import jsonData from '../../../data/reference-data/schematics.json';
import type { LocalizedString, TypeIDQuantity, TypeQuantity } from './sharedTypes';
import { getType } from './type';

const schematicData: { [schematic_id: string]: Schematic } = jsonData as any;

export interface Schematic {
  readonly schematic_id: number;
  readonly cycle_time: number;
  readonly name: LocalizedString;
  readonly materials: { [type_id: string]: TypeIDQuantity };
  readonly products: { [type_id: string]: TypeIDQuantity };
  readonly pin_type_ids: number[];
}

export function getSchematic(schematic_id: number) {
  const data = schematicData[schematic_id];
  if (!data) throw new Error(`Schematic ID ${schematic_id} not found in reference data`);
  return data;
}

export function getMaterialQuantities(schematic: Schematic) {
  return Object.entries(schematic.materials).map(([type_id, { quantity }]) => ({
    type: getType(Number(type_id)),
    quantity,
  }));
}

export function getProductQuantities(schematic: Schematic) {
  return Object.entries(schematic.products).map(([type_id, { quantity }]) => ({
    type: getType(Number(type_id)),
    quantity,
  }));
}

export function getPinTypes(schematic: Schematic) {
  return schematic.pin_type_ids.map(getType);
}

