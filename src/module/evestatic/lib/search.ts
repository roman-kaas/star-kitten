import MiniSearch from "minisearch";
import { getMarketGroup } from "../models/marketGroup";
import { getType, typeData, type Type } from "../models/type";

export enum MarkgetGroupIds {
  SHIPS = 4,
  MODULES = 9,
  DRONES = 157,
  IMPLANTS = 541,
  BOOSTERS = 303,
  STRUCTURES = 477,
  APPAREL = 475,
  SKILLBOOKS = 150,
  ALL = 0
}

export class Search {
  private static instances: { [key: number]: Search } = {};
  private miniSearch: MiniSearch;

  private constructor(private readonly market_group_id: MarkgetGroupIds) {

    this.miniSearch = new MiniSearch({
      fields: ['name.en', 'name.de', 'name.fr', 'name.ru', 'name.ja', 'name.zh'],
      extractField: (type: Type, fieldName: string) => {
        return fieldName.split('.').reduce((obj, key) => obj[key], type);
      },
      storeFields: ['name', 'type_id'],
      idField: 'type_id',
      searchOptions: {
        prefix: true,
        fuzzy: 0.1,
      },
    });

    if (market_group_id === MarkgetGroupIds.ALL) {
      const types = Object.values(typeData).filter(
        (type) => type.published,
      );
      this.miniSearch.addAll(types);
    } else {
      const markgetGroup = getMarketGroup(market_group_id);
      const markget_group_ids = markgetGroup.all_children_ids;
      const types = Object.values(typeData).filter(
        (type) => type.published && markget_group_ids.indexOf(type.market_group_id) !== -1,
      );
      this.miniSearch.addAll(types);
    }
  }

  static getInstance(market_group_id: MarkgetGroupIds) {
    if (!this.instances[market_group_id]) {
      this.instances[market_group_id] = new Search(market_group_id);
    }
    return this.instances[market_group_id];
  }

  searchByName(name: string) {
    const results = this.miniSearch.search(name);
    if (results.length === 0) return null;
    return getType(results[0].id);
  }
}
