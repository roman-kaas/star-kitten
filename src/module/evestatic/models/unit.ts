import jsonData from '$data/reference-data/units.json';
import { convertMillisecondsToTimeString, convertSecondsToTimeString } from '$discord';
import { getGroup } from './group';
import type { LocalizedString } from './sharedTypes';
import { getType } from './type';

export const unitData: { [unit_id: string]: Unit } = jsonData as any;

const sizeMap = {
  1: 'Small',
  2: 'Medium',
  3: 'Large',
  4: 'X-Large',
};

export class Unit {
  public readonly unit_id: number;
  public readonly display_name: string;
  public readonly desccription: LocalizedString;
  public readonly name: LocalizedString;

  constructor(unit_id: number) {
    const data = unitData[unit_id];
    if (!data) throw new Error(`Unit ID ${unit_id} not found in reference data`);
    this.unit_id = unit_id;
    this.display_name = data.display_name;
    this.desccription = data.desccription;
    this.name = data.name;
  }

  public renderValue(value: number, locale: string = 'en'): string {
    switch (this.unit_id) {
      case 108: // inverse percentage
      case 111: // Inverse percentage
        return [(1 - value).toFixed(2), this.display_name ?? ''].join(' ');
      case 3: // seconds
        return `${convertSecondsToTimeString(value)}`;
      case 101: // milliseconds
        return `${convertMillisecondsToTimeString(value)}`;
      case 117: // size class
        return sizeMap[value] ?? 'Unknown';
      case 141: // hardpoints
        return value + '';
      case 120: // calibration
        return value + ' pts';
      case 116: // typeID
        return getType(value)?.renderEveRefLink(locale) ?? 'Unknown';
      case 10: // m/s
        return `${value} m/s`;
      case 11: // meters per second squared
        return `${value} m/s²`;
      case 9: // cubic meters
        return `${value} m³`;
      case 8: // square meters
        return `${value} m²`;
      case 12: // reciprocal meters
        return `${value} m⁻¹`;
      case 128: // megabits per second
        return `${value} Mbps`;
      case 115: // groupID
        return getGroup(value)?.renderEveRefLink(locale) ?? 'Unknown';
      default:
        return [value, this.display_name ?? ''].join(' ');
    }
  }

  get isInversePercentage(): boolean {
    return this.unit_id == 108 || this.unit_id == 111;
  }
}

export const getUnit = (unit_id: number): Unit => new Unit(unit_id);
