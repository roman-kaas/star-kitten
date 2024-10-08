import type { EveTokens } from './auth';
import { esiFetch } from './fetch';
import { tokenHasScopes } from './scopes';

// PUBLIC APIS ---------------------------------------------------------------

export interface CharacterData {
  alliance_id: number;
  birthday: string;
  bloodline_id: number;
  corporation_id: number;
  description: string;
  faction_id: number;
  gender: 'male' | 'female';
  name: string;
  race_id: number;
  security_status: number;
  title: string;
}

export function getCharacterPublicData(id: number) {
  return esiFetch<Partial<CharacterData>>(`/characters/${id}/`);
}

export interface CharacterAffiliations {
  alliance_id: number;
  character_id: number;
  corporation_id: number;
  faction_id: number;
}

export function getCharacterAffiliations(ids: number[]) {
  return esiFetch<Partial<CharacterAffiliations>[]>(`/characters/affiliation/`, undefined, {
    method: 'POST',
    body: JSON.stringify(ids),
  })[0] as Partial<CharacterAffiliations>;
}

export interface CharacterPortraits {
  px128x128: string;
  px256x256: string;
  px512x512: string;
  px64x64: string;
}

export function getCharacterPortraits(id: number) {
  return esiFetch<Partial<CharacterPortraits>>(`/characters/${id}/portrait/`);
}

export interface CharacterCorporationHistory {
  corporation_id: number;
  is_deleted: boolean;
  record_id: number;
  start_date: string;
}

export function getCharacterCorporationHistory(id: number) {
  return esiFetch<Partial<CharacterCorporationHistory>[]>(`/characters/${id}/corporationhistory/`);
}

export function getPortraitURL(id: number) {
  return `https://images.evetech.net/characters/${id}/portrait`;
}

// PRIVATE APIS --------------------------------------------------------------

export interface CharacterRoles {
  roles: string[];
  roles_at_base: string[];
  roles_at_hq: string[];
  roles_at_other: string[];
}

// required scope: esi-characters.read_corporation_roles.v1
export function getCharacterRoles(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_corporation_roles.v1')) return null;
  return esiFetch<Partial<CharacterRoles>>(`/characters/${id}/roles/`, token);
}

export interface CharacterTitles {
  titles: {
    name: string;
    title_id: number;
  }[];
}

// required scope: esi-characters.read_titles.v1
export function getCharacterTitles(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_titles.v1')) return null;
  return esiFetch<Partial<CharacterTitles>>(`/characters/${id}/titles/`, token);
}

export interface CharacterStandings {
  from_id: number;
  from_type: 'agent' | 'npc_corp' | 'faction';
  standing: number;
}

// required scope: esi-characters.read_standings.v1
export function getCharacterStandings(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_standings.v1')) return null;
  return esiFetch<Partial<CharacterStandings>[]>(`/characters/${id}/standings/`, token);
}

export interface Notification {
  is_read: boolean;
  sender_id: number;
  sender_type: 'character' | 'corporation' | 'alliance' | 'faction' | 'system';
  text: string;
  timestamp: string;
  type:
  | 'character'
  | 'corporation'
  | 'alliance'
  | 'faction'
  | 'inventory'
  | 'industry'
  | 'loyalty'
  | 'skills'
  | 'sov'
  | 'structures'
  | 'war';
}

// required scope: esi-characters.read_notifications.v1
export function getCharacterNotifications(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_notifications.v1')) return null;
  return esiFetch<Partial<Notification>[]>(`/characters/${id}/notifications/`, token);
}

export interface ContactNotification {
  message: string;
  notification_id: number;
  send_date: string;
  sender_character_id: number;
  standing_level: number;
}

// required scope: esi-characters.read_notifications.v1
export function getCharacterContactNotifications(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_notifications.v1')) return null;
  return esiFetch<Partial<ContactNotification>[]>(`/characters/${id}/notifications/contacts`, token);
}

export interface Medals {
  corporation_id: number;
  date: string;
  description: string;
  graphics: {
    color: number;
    graphic: number;
    layer: number;
    part: number;
  }[];
  issuer_id: number;
  medal_id: number;
  reason: string;
  status: 'private' | 'public';
  title: string;
}

// required scope: esi-characters.read_medals.v1
export function getCharacterMedals(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_medals.v1')) return null;
  return esiFetch<Partial<Medals>[]>(`/characters/${id}/medals/`, token);
}

export interface JumpFatigue {
  jump_fatigue_expire_date: string;
  last_jump_date: string;
  last_update_date: string;
}

// required scope: esi-characters.read_fatigue.v1
export function getCharacterJumpFatigue(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_fatigue.v1')) return null;
  return esiFetch<Partial<JumpFatigue>>(`/characters/${id}/fatigue/`, token);
}

export interface Blueprint {
  item_id: number;
  location_flag: string;
  location_id: number;
  material_efficiency: number;
  quantity: number;
  runs: number;
  time_efficiency: number;
  type_id: number;
}

// required scope: esi-characters.read_blueprints.v1
export function getCharacterBlueprints(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_blueprints.v1')) return null;
  return esiFetch<Partial<Blueprint>[]>(`/characters/${id}/blueprints/`, token);
}

export interface AgentResearch {
  agent_id: number;
  points_per_day: number;
  remainder_points: number;
  skill_type_id: number;
  started_at: string;
}

// required scope: esi-characters.read_agents_research.v1
export function getCharacterAgentResearch(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-characters.read_agents_research.v1')) return null;
  return esiFetch<Partial<AgentResearch>[]>(`/characters/${id}/agents_research/`, token);
}

// CLONES --------------------------------------------------------------------

export interface Clones {
  home_location: {
    location_id: number;
    location_type: 'station' | 'structure';
  };
  jump_clones: {
    implants: number[];
    jump_clone_id: number;
    location_id: number;
    location_type: 'station' | 'structure';
    name: string;
  }[];
  last_clone_jump_date: string;
  last_station_change_date: string;
}

// required scope: esi-clones.read_clones.v1
export function getCharacterClones(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-clones.read_clones.v1')) return null;
  return esiFetch<Partial<Clones>>(`/characters/${id}/clones/`, token);
}

// required scope: esi-clones.read_implants.v1
export function getCharacterImplants(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-clones.read_implants.v1')) return null;
  return esiFetch<number[]>(`/characters/${id}/implants/`, token);
}

// ASSETS --------------------------------------------------------------------

export interface Asset {
  is_blueprint_copy: boolean;
  is_singleton: boolean;
  item_id: number;
  location_flag: string;
  location_id: number;
  location_type: 'station' | 'solar_system' | 'other';
  quantity: number;
  type_id: number;
}

// required scope: esi-assets.read_assets.v1
export function getCharacterAssets(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-assets.read_assets.v1')) return null;
  return esiFetch<Partial<Asset>[]>(`/characters/${id}/assets/`, token);
}

export interface AssetLocation {
  item_id: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

// required scope: esi-assets.read_assets.v1
export function getCharacterAssetLocations(id: number, token: EveTokens, ids: number[]) {
  if (!tokenHasScopes(token.access_token, 'esi-assets.read_assets.v1')) return null;
  return esiFetch<Partial<AssetLocation>[]>(`/characters/${id}/assets/locations/`, token, {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}

export interface AssetNames {
  item_id: number;
  name: string;
}

// required scope: esi-assets.read_assets.v1
export function getCharacterAssetNames(id: number, token: EveTokens, ids: number[]) {
  if (!tokenHasScopes(token.access_token, 'esi-assets.read_assets.v1')) return null;
  return esiFetch<Partial<AssetNames>[]>(`/characters/${id}/assets/names/`, token, {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}
