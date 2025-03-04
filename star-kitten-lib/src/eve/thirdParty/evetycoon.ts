const base_url = 'https://evetycoon.com/api/v1';

export interface Price {
  buyVolume: number;
  sellVolume: number;
  buyOrders: number;
  sellOrders: number;
  buyOutliers: number;
  sellOutliers: number;
  buyThreshold: number;
  sellThreshold: number;
  buyAvgFivePercent: number;
  sellAvgFivePercent: number;
  maxBuy: number;
  minSell: number;
}

enum Region {
  TheForge = 10000002,
}

export const fetchPrice = async (type_id: number, region_id: number = Region.TheForge): Promise<Price> => {
  const response = await fetch(`${base_url}/market/stats/${region_id}/${type_id}`);
  return (await response.json()) as Price;
};
