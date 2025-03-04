import type { Character } from '@db';
import { esiFetch } from './fetch';

// PUBLIC APIS ---------------------------------------------------------------

interface CorporationData {
  alliance_id: number;
  ceo_id: number;
  creator_id: number;
  date_founded: string;
  description: string;
  faction_id: number;
  home_station_id: number;
  member_count: number;
  name: string;
  shares: number;
  tax_rate: number;
  ticker: string;
  url: string;
  war_eligible: boolean;
}

export async function getCorporationData(id: number) {
  return await esiFetch<Partial<CorporationData>>(`/corporations/${id}/`);
}

interface AllianceHistory {
  alliance_id: number;
  is_deleted: boolean;
  record_id: number;
  start_date: string;
}

export async function getCorporationAllianceHistory(id: number) {
  return await esiFetch<Partial<AllianceHistory>[]>(`/corporations/${id}/alliancehistory/`);
}

interface CorporationIcons {
  px256x256: string;
  px128x128: string;
  px64x64: string;
}

export async function getCorporationIcons(id: number) {
  return await esiFetch<Partial<CorporationIcons>>(`/corporations/${id}/icons/`);
}

// ASSETS -------------------------------------------------------------------

export interface AssetData {
  is_blueprint_copy: boolean;
  is_singleton: boolean;
  item_id: number;
  location_flag: string;
  location_id: number;
  location_type: string;
  quantity: number;
  type_id: number;
}

// required scope: esi-assets.read_corporation_assets.v1
export async function getCorporationAssets(id: number, character: Character) {
  if (!character.hasScope('esi-assets.read_corporation_assets.v1')) return null;
  return await esiFetch<Partial<AssetData>[]>(`/corporations/${id}/assets/`, character);
}

export interface AssetLocation {
  item_id: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

// required scope: esi-assets.read_corporation_assets.v1
export async function getCorporationAssetLocations(id: number, character: Character, ids: number[]) {
  if (!character.hasScope('esi-assets.read_corporation_assets.v1')) return null;
  return await esiFetch<Partial<AssetLocation>[]>(`/corporations/${id}/assets/locations/`, character, {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}

export interface AssetNames {
  item_id: number;
  name: string;
}

// required scope: esi-assets.read_corporation_assets.v1
export async function getCorporationAssetNames(id: number, character: Character, ids: number[]) {
  if (!character.hasScope('esi-assets.read_corporation_assets.v1')) return null;
  return await esiFetch<Partial<AssetNames>[]>(`/corporations/${id}/assets/names/`, character, {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}
