import jsonData from '../../../data/reference-data/market_groups.json';
import type { LocalizedString } from './sharedTypes';

export const marketGroups: { [market_group_id: string]: MarketGroup } = jsonData as any;

export interface MarketGroup {
  readonly market_group_id: number;
  readonly parent_group_id: number;
  readonly name: LocalizedString;
  readonly description: LocalizedString;
  readonly child_market_group_ids: number[];
  readonly icon_id: number;
  readonly has_types: boolean;
}

export function getMarketGroup(market_group_id: number) {
  const data = marketGroups[market_group_id];
  if (!data) throw new Error(`Market group ID ${market_group_id} not found in reference data`);
  return data;
}

export function getAllChildMarketGroups(marketGroup: MarketGroup): MarketGroup[] {
  const children = marketGroup.child_market_group_ids.map((id) => getMarketGroup(id));
  return children.concat(...children.map((child) => getAllChildMarketGroups(child)));
}

export const searchMarketGroupByName = (name: string, locale: string = 'en') => {
  const group = Object.values(marketGroups).find((group) => group.name[locale] === name);
  return group ? getMarketGroup(group.market_group_id) : null;
};
