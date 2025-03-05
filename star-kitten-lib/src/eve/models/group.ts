import jsonData from '../../../data/reference-data/groups.json';
import type { LocalizedString } from './sharedTypes';

export const groupData: { [group_id: string]: Group } = jsonData as any;

export interface Group {
  readonly group_id: number;
  readonly category_id: number;
  readonly name: LocalizedString;
  readonly published: boolean;
  readonly icon_id?: number;
  readonly anchorable: boolean;
  readonly anchored: boolean;
  readonly fittable_non_singleton: boolean;
  readonly use_base_price: boolean;
  readonly type_ids?: number[];
}
export function getGroup(group_id: number) {
  const data = groupData[group_id];
  if (!data) throw new Error(`Group ID ${group_id} not found in reference data`);
  return data;
}

export function groupEveRefLink(group_id: number) {
  return `https://everef.net/groups/${group_id}`;
}

export function renderGroupEveRefLink(group: Group, locale: string = 'en') {
  return `[${group.name[locale] ?? group.name.en}](${groupEveRefLink(group.group_id)})`;
}
