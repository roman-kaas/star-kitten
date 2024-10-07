import jsonData from '$data/reference-data/meta_groups.json';
import type { LocalizedString } from './sharedTypes';

export const metaGroupData: { [meta_group_id: string]: MetaGroup } = jsonData as any;

export class MetaGroup {
  public readonly meta_group_id: number;
  public readonly name: LocalizedString;
  public readonly type_ids: number[];
  public readonly icon_id?: number;
  public readonly icon_suffix?: string;

  constructor(meta_group_id: number) {
    const data = metaGroupData[meta_group_id];
    if (!data) throw new Error(`MetaGroup ${meta_group_id} not found`);
    this.meta_group_id = meta_group_id;
    this.name = data.name;
    this.type_ids = data.type_ids;
    this.icon_id = data.icon_id;
    this.icon_suffix = data.icon_suffix;
  }
}

export const getMetaGroup = (meta_group_id: number) => new MetaGroup(meta_group_id);
