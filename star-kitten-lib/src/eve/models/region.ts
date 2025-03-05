import jsonData from '../../../data/reference-data/regions.json';
import type { LocalizedString, Position } from './sharedTypes';

export const regionData: { [region_id: string]: Region } = jsonData as any;

export interface Region {
  readonly region_id: number;
  readonly center: Position;
  readonly description_id: number;
  readonly faction_id: number;
  readonly max: Position;
  readonly min: Position;
  readonly name_id: number;
  readonly wormhole_class_id?: number;
  readonly nebula_id?: number;
  readonly universe_id: string;
  readonly description: LocalizedString;
  readonly name: LocalizedString;
}

export function getRegion(region_id: number): Region {
  const data = regionData[region_id];
  if (!data) throw new Error(`Region ID ${region_id} not found in reference data`);
  return data;
}
