import jsonData from '../../../data/reference-data/units.json';
import { convertMillisecondsToTimeString, convertSecondsToTimeString } from '../../utils/text';
import { getGroup, renderGroupEveRefLink } from './group';
import type { LocalizedString } from './sharedTypes';
import { getType, renderTypeEveRefLink } from './type';

export const unitData: { [unit_id: string]: Unit } = jsonData as any;

const sizeMap = {
  1: 'Small',
  2: 'Medium',
  3: 'Large',
  4: 'X-Large',
};

export interface Unit {
  readonly unit_id: number;
  readonly display_name: string;
  readonly desccription: LocalizedString;
  readonly name: LocalizedString;
}

export function getUnit(unit_id: number) {
  const data = unitData[unit_id];
  if (!data) throw new Error(`Unit ID ${unit_id} not found in reference data`);
  return data;
}

export function renderUnit(unit: Unit, value: number, locale: string = 'en'): string {
  switch (unit.unit_id) {
    case 108: // inverse percentage
    case 111: // Inverse percentage
      return [(1 - value).toFixed(2), unit.display_name ?? ''].join(' ');
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
      return renderTypeEveRefLink(getType(value), locale) ?? 'Unknown';
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
      return renderGroupEveRefLink(getGroup(value), locale) ?? 'Unknown';
    default:
      return [value, unit.display_name ?? ''].join(' ');
  }
}

export function isUnitInversePercentage(unit: Unit) {
  return unit.unit_id == 108 || unit.unit_id == 111;
}

