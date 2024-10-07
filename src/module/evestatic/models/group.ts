import jsonData from '$data/reference-data/groups.json';
import type { LocalizedString } from './sharedTypes';
import { getCategory, type Category } from './category';
import { getType, type Type } from './type';
import { getIcon, type Icon } from './icon';

export const groupData: { [group_id: string]: Group } = jsonData as any;

export class Group {
  public readonly group_id: number;
  public readonly category_id: number;
  public readonly name: LocalizedString;
  public readonly published: boolean;
  public readonly icon_id?: number;
  public readonly anchorable: boolean;
  public readonly anchored: boolean;
  public readonly fittable_non_singleton: boolean;
  public readonly use_base_price: boolean;
  public readonly type_ids?: number[];

  constructor(group_id: number) {
    const data = groupData[group_id];
    if (!data) throw new Error(`Group ID ${group_id} not found in reference data`);
    this.group_id = group_id;
    this.category_id = data.category_id;
    this.name = data.name;
    this.published = data.published;
    this.icon_id = data.icon_id;
    this.anchorable = data.anchorable;
    this.anchored = data.anchored;
    this.fittable_non_singleton = data.fittable_non_singleton;
    this.use_base_price = data.use_base_price;
    this.type_ids = data.type_ids;
  }

  public get category(): Category {
    return getCategory(this.category_id);
  }

  public get icon(): Icon {
    return getIcon(this.icon_id);
  }

  public get types(): Type[] {
    return this.type_ids.map(getType);
  }

  get eveRefLink() {
    return `https://everef.net/groups/${this.group_id}`;
  }

  renderEveRefLink(locale: string = 'en') {
    return `[${this.name[locale] ?? this.name.en}](${this.eveRefLink})`;
  }
}

export const getGroup = (group_id: number): Group => new Group(group_id);
