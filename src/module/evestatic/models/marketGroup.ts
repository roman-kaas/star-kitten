import jsonData from '$data/reference-data/market_groups.json';
import { getIcon } from './icon';
import type { LocalizedString } from './sharedTypes';

export const marketGroups: { [market_group_id: string]: MarketGroup } = jsonData as any;

export class MarketGroup {
  public readonly market_group_id: number;
  public readonly parent_group_id: number;
  public readonly name: LocalizedString;
  public readonly description: LocalizedString;
  public readonly child_market_group_ids: number[];
  public readonly icon_id: number;
  public readonly has_types: boolean;

  constructor(group_id: number) {
    const data = marketGroups[group_id];
    if (!data) {
      throw new Error(`Market group ${group_id} not found`);
    }
    this.market_group_id = group_id;
    this.parent_group_id = data.parent_group_id;
    this.name = data.name;
    this.description = data.description;
    this.child_market_group_ids = data.child_market_group_ids;
    this.icon_id = data.icon_id;
    this.has_types = data.has_types;
  }

  public get children() {
    if (!this.child_market_group_ids) {
      return [];
    }
    return this.child_market_group_ids.map((id) => new MarketGroup(id));
  }

  public get parent() {
    if (!this.parent_group_id) {
      return null;
    }
    return new MarketGroup(this.parent_group_id);
  }

  public get icon() {
    return getIcon(this.icon_id);
  }

  public get allChildren(): MarketGroup[] {
    const children = this.children;
    return children.concat(...children.map((child) => child.allChildren));
  }

  public get all_children_ids(): number[] {
    return this.allChildren.map((child) => child.market_group_id);
  }
}

export const getMarketGroup = (group_id: number) => new MarketGroup(group_id);

export const searchMarketGroupByName = (name: string, locale: string = 'en') => {
  const group = Object.values(marketGroups).find((group) => group.name[locale] === name);
  return group ? new MarketGroup(group.market_group_id) : null;
};
