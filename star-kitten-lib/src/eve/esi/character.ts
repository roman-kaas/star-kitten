import { CharacterHelper, type Character } from '../../db';
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
export function getCharacterRoles(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_corporation_roles.v1')) return null;
  return esiFetch<Partial<CharacterRoles>>(`/characters/${character.eveID}/roles/`, character);
}

export interface CharacterTitles {
  titles: {
    name: string;
    title_id: number;
  }[];
}

// required scope: esi-characters.read_titles.v1
export function getCharacterTitles(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_titles.v1')) return null;
  return esiFetch<Partial<CharacterTitles>>(`/characters/${character.eveID}/titles/`, character);
}

export interface CharacterStandings {
  from_id: number;
  from_type: 'agent' | 'npc_corp' | 'faction';
  standing: number;
}

// required scope: esi-characters.read_standings.v1
export function getCharacterStandings(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_standings.v1')) return null;
  return esiFetch<Partial<CharacterStandings>[]>(`/characters/${character.eveID}/standings/`, character);
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
export function getCharacterNotifications(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_notifications.v1')) return null;
  return esiFetch<Partial<Notification>[]>(`/characters/${character.eveID}/notifications/`, character);
}

export interface ContactNotification {
  message: string;
  notification_id: number;
  send_date: string;
  sender_character_id: number;
  standing_level: number;
}

// required scope: esi-characters.read_notifications.v1
export function getCharacterContactNotifications(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_notifications.v1')) return null;
  return esiFetch<Partial<ContactNotification>[]>(`/characters/${character.eveID}/notifications/contacts`, character);
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
export function getCharacterMedals(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_medals.v1')) return null;
  return esiFetch<Partial<Medals>[]>(`/characters/${character.eveID}/medals/`, character);
}

export interface JumpFatigue {
  jump_fatigue_expire_date: string;
  last_jump_date: string;
  last_update_date: string;
}

// required scope: esi-characters.read_fatigue.v1
export function getCharacterJumpFatigue(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_fatigue.v1')) return null;
  return esiFetch<Partial<JumpFatigue>>(`/characters/${character.eveID}/fatigue/`, character);
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
export function getCharacterBlueprints(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_blueprints.v1')) return null;
  return esiFetch<Partial<Blueprint>[]>(`/characters/${character.eveID}/blueprints/`, character);
}

export interface AgentResearch {
  agent_id: number;
  points_per_day: number;
  remainder_points: number;
  skill_type_id: number;
  started_at: string;
}

// required scope: esi-characters.read_agents_research.v1
export function getCharacterAgentResearch(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-characters.read_agents_research.v1')) return null;
  return esiFetch<Partial<AgentResearch>[]>(`/characters/${character.eveID}/agents_research/`, character);
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
export function getCharacterClones(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-clones.read_clones.v1')) return null;
  return esiFetch<Partial<Clones>>(`/characters/${character.eveID}/clones/`, character);
}

// required scope: esi-clones.read_implants.v1
export function getCharacterImplants(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-clones.read_implants.v1')) return null;
  return esiFetch<number[]>(`/characters/${character.eveID}/implants/`, character);
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
export function getCharacterAssets(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-assets.read_assets.v1')) return null;
  return esiFetch<Partial<Asset>[]>(`/characters/${character.eveID}/assets/`, character);
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
export function getCharacterAssetLocations(character: Character, ids: number[]) {
  if (!CharacterHelper.hasScope(character, 'esi-assets.read_assets.v1')) return null;
  return esiFetch<Partial<AssetLocation>[]>(`/characters/${character.eveID}/assets/locations/`, character, {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}

export interface AssetNames {
  item_id: number;
  name: string;
}

// required scope: esi-assets.read_assets.v1
export function getCharacterAssetNames(character: Character, ids: number[]) {
  if (!CharacterHelper.hasScope(character, 'esi-assets.read_assets.v1')) return null;
  return esiFetch<Partial<AssetNames>[]>(`/characters/${character.eveID}/assets/names/`, character, {
    method: 'POST',
    body: JSON.stringify(ids),
  });
}

// WALLET --------------------------------------------------------------------

// required scope: esi-wallet.read_character_wallet.v1
export function getCharacterWallet(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-wallet.read_character_wallet.v1')) return null;
  return esiFetch<number>(`/characters/${character.eveID}/wallet/`, character);
}

export interface WalletTransaction {
  client_id: number;
  date: string;
  is_buy: boolean;
  is_personal: boolean;
  journal_ref_id: number;
  location_id: number;
  quantity: number;
  transaction_id: number;
  type_id: number;
  unit_price: number;
}

// required scope: esi-wallet.read_character_wallet.v1
export function getCharacterWalletTransactions(character: Character, fromId: number) {
  if (!CharacterHelper.hasScope(character, 'esi-wallet.read_character_wallet.v1')) return null;
  return esiFetch<Partial<WalletTransaction>[]>(`/characters/${character.eveID}/wallet/transactions/`, character, {
    method: 'POST',
    body: JSON.stringify(fromId),
  });
}


export interface WalletJournalEntry {
  amount: number; // The amount of ISK given or taken from the wallet as a result of the given transaction. Positive when ISK is deposited into the wallet and negative when ISK is withdrawn
  balance: number; // Wallet balance after transaction occurred
  context_id: number; // And ID that gives extra context to the particualr transaction. Because of legacy reasons the context is completely different per ref_type and means different things. It is also possible to not have a context_id
  context_id_type: 'character' | 'corporation' | 'alliance' | 'faction'; // The type of the given context_id if present
  date: string; // Date and time of transaction
  description: string;
  first_party_id: number;
  id: number;
  reason: string;
  ref_type: 'agent' | 'assetSafety' | 'bounty' | 'bountyPrizes' | 'contract' | 'dividend' | 'marketTransaction' | 'other';
  second_party_id: number;
  tax: number;
  tax_receiver_id: number;
}

// required scope: esi-wallet.read_character_wallet.v1
export function getCharacterWalletJournal(character: Character, page: number = 1) {
  if (!CharacterHelper.hasScope(character, 'esi-wallet.read_character_wallet.v1')) return null;
  return esiFetch<Partial<WalletJournalEntry>[]>(`/characters/${character.eveID}/wallet/journal/?page=${page}`, character);
}


// LOCATION --------------------------------------------------

export interface Location {
  solar_system_id: number;
  station_id: number;
  structure_id: number;
}

// required scope: esi-location.read_location.v1
export function getCharacterLocation(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-location.read_location.v1')) return null;
  return esiFetch<Partial<Location>>(`/characters/${character.eveID}/location/`, character);
}

export interface Online {
  last_login: string;
  last_logout: string;
  logins: number;
  online: boolean;
}

// required scope: esi-location.read_online.v1
export function getCharacterOnline(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-location.read_online.v1')) return null;
  return esiFetch<Partial<Online>>(`/characters/${character.eveID}/online/`, character);
}

export interface CurrentShip {
  ship_item_id: number;
  ship_type_id: number;
  ship_name: string;
}

// required scope: esi-location.read_ship_type.v1
export function getCharacterCurrentShip(character: Character) {
  if (!CharacterHelper.hasScope(character, 'esi-location.read_ship_type.v1')) return null;
  return esiFetch<Partial<CurrentShip>>(`/characters/${character.eveID}/ship/`, character);
}