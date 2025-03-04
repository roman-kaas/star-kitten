import { env } from "bun";

const base_url = 'https://janice.e-351.com/api/rest/v2';

export interface Appraisal {
  id: number;
  created: string;
  expires: string;
  datasetTime: string;
  code: string;
  designation: AppraisalDesignation;
  pricing: AppraisalPricing;
  pricingVariant: AppraisalPricingVariant;
  pricePercentage: number;
  isCompactized: boolean;
  failures: string;
  market: PricerMarket;
  totalVolume: number;
  totalPackagedVolume: number;
  effectivePrices: AppraisalValues;
  immediatePrices: AppraisalValues;
  top5AveragePrices: AppraisalValues;
  items: AppraisalItem[];
}

export interface AppraisalValues {
  totalBuyPrice: number;
  totalSplitPrice: number;
  totalSellPrice: number;
}

export interface AppraisalItem {
  id: number;
  amount: number;
  buyOrderCount: number;
  buyVolume: number;
  sellOrderCount: number;
  sellVolume: number;
  effectivePrices: AppraisalItemValues;
  immediatePrices: AppraisalItemValues;
  top5AveragePrices: AppraisalItemValues;
  totalVolume: number;
  totalPackagedVolume: number;
  itemType: ItemType;
}

export interface PricerItem {
  date: string;
  market: PricerMarket;
  buyOrderCount: number;
  buyVolume: number;
  sellOrderCount: number;
  sellVolume: number;
  immediatePrices: PricerItemValues;
  top5AveragePrices: PricerItemValues;
  itemType: ItemType;
}

export interface PricerItemValues {
  buyPrice: number;
  splitPrice: number;
  sellPrice: number;
  buyPrice5DayMedian: number;
  splitPrice5DayMedian: number;
  sellPrice5DayMedian: number;
  buyPrice30DayMedian: number;
  splitPrice30DayMedian: number;
  sellPrice30DayMedian: number;
}

export interface AppraisalItemValues extends PricerItemValues {
  buyPriceTotal: number;
  splitPriceTotal: number;
  sellPriceTotal: number;
}

export interface ItemType {
  eid: number;
  name?: string;
  volume: number;
  packagedVolume: number;
}

export enum AppraisalDesignation {
  Appraisal = 'appraisal',
  WantToBuy = 'wtb',
  WantToSell = 'wts',
}

export enum AppraisalPricing {
  Buy = 'buy',
  Split = 'split',
  Sell = 'sell',
  Purchase = 'purchase',
}

export enum AppraisalPricingVariant {
  Immediate = 'immediate',
  Top5Percent = 'top5percent',
}

export interface PricerMarket {
  id: number;
  name: string;
}

export const markets: PricerMarket[] = [
  {
    id: 2,
    name: 'Jita 4-4'
  },
  {
    id: 3,
    name: 'R1O-GN'
  },
  {
    id: 6,
    name: 'NPC'
  },
  {
    id: 114,
    name: 'MJ-5F9'
  },
  {
    id: 115,
    name: 'Amarr'
  },
  {
    id: 116,
    name: 'Rens'
  },
  {
    id: 117,
    name: 'Dodixie'
  },
  {
    id: 118,
    name: 'Hek'
  }
];


export const fetchPrice = async (type_id: number, market_id: number = 2): Promise<PricerItem> => {
  const response = await fetch(`${base_url}/pricer/${type_id}?market=${market_id}`, {
    method: 'GET',
    headers: {
      'X-ApiKey': process.env.JANICE_KEY,
      'Accept': 'application/json',
    },
  });
  return (await response.json()) as PricerItem;
}

export const fetchPrices = async (type_ids: number[], market_id: number = 2): Promise<PricerItem[]> => {
  const response = await fetch(`${base_url}/pricer?market=${market_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-ApiKey': process.env.JANICE_KEY,
      'Accept': 'application/json',
    },
    body: type_ids.join('\n'),
  });
  return (await response.json()) as PricerItem[];
}

export const fetchAppraisal = async (code: string): Promise<Appraisal> => {
  const response = await fetch(`${base_url}/appraisal/${code}`, {
    method: 'GET',
    headers: {
      'X-ApiKey': process.env.JANICE_KEY,
      'Accept': 'application/json',
    },
  });
  return (await response.json()) as Appraisal;
}

export const appraiseItems = async (text: string, market_id: number = 2): Promise<Appraisal> => {
  const response = await fetch(`${base_url}/appraisal?market=${market_id}&persist=true&compactize=true&pricePercentage=1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'X-ApiKey': process.env.JANICE_KEY,
      'Accept': 'application/json',
    },
    body: text,
  });
  return (await response.json()) as Appraisal;
}

