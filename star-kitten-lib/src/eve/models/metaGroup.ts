import jsonData from '../../../data/reference-data/meta_groups.json';
import type { LocalizedString } from './sharedTypes';

export const metaGroupData: { [meta_group_id: string]: MetaGroup } = jsonData as any;

export interface MetaGroup {
  readonly meta_group_id: number;
  readonly name: LocalizedString;
  readonly type_ids: number[];
  readonly icon_id?: number;
  readonly icon_suffix?: string;
}

export function getMetaGroup(meta_group_id: number) {
  const data = metaGroupData[meta_group_id];
  if (!data) throw new Error(`Meta group ID ${meta_group_id} not found in reference data`);
  return data;
}
