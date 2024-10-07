import jsonData from '$data/reference-data/regions.json';
import type { LocalizedString, Position } from './sharedTypes';

export const regionData: { [region_id: string]: Region } = jsonData as any;

export class Region {
  public readonly region_id: number;
  public readonly center: Position;
  public readonly description_id: number;
  public readonly faction_id: number;
  public readonly max: Position;
  public readonly min: Position;
  public readonly name_id: number;
  public readonly wormhole_class_id?: number;
  public readonly nebula_id?: number;
  public readonly universe_id: string;
  public readonly description: LocalizedString;
  public readonly name: LocalizedString;

  constructor(region_id: number) {
    const data = regionData[region_id];
    if (!data) throw new Error(`Region ID ${region_id} not found in reference data`);
    this.region_id = region_id;
    this.center = data.center;
    this.description_id = data.description_id;
    this.faction_id = data.faction_id;
    this.max = data.max;
    this.min = data.min;
    this.name_id = data.name_id;
    this.wormhole_class_id = data.wormhole_class_id;
    this.nebula_id = data.nebula_id;
    this.universe_id = data.universe_id;
    this.description = data.description;
    this.name = data.name;
  }
}

export const getRegion = (region_id: number): Region => new Region(region_id);
