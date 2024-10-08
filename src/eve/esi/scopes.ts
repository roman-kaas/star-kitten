import { jwtDecode } from "jwt-decode";

export const EVE_JWKS_URL = 'https://login.eveonline.com/oauth/jwks';
export const EVE_ISSUER = 'login.eveonline.com';
export const EVE_AUDIENCE = 'eveonline';
export const ESI_LATEST_URL = 'https://esi.evetech.net/latest';
export const DATA_SOURCE = 'tranquility';

export function joinScopes(...scopes: string[]) {
  return scopes.join(' ');
}

export enum ESI_SCOPES {
  PUBLIC_DATA = 'publicData',
  CALENDAR_RESPOND_CALENDAR_EVENTS = 'esi-calendar.respond_calendar_events.v1',
  CALENDAR_READ_CALENDAR_EVENTS = 'esi-calendar.read_calendar_events.v1',
  LOCATION_READ_LOCATION = 'esi-location.read_location.v1',
  LOCATION_READ_SHIP_TYPE = 'esi-location.read_ship_type.v1',
  MAIL_ORGANIZE_MAIL = 'esi-mail.organize_mail.v1',
  MAIL_READ_MAIL = 'esi-mail.read_mail.v1',
  MAIL_SEND_MAIL = 'esi-mail.send_mail.v1',
  SKILLS_READ_SKILLS = 'esi-skills.read_skills.v1',
  SKILLS_READ_SKILLQUEUE = 'esi-skills.read_skillqueue.v1',
  WALLET_READ_CHARACTER_WALLET = 'esi-wallet.read_character_wallet.v1',
  WALLET_READ_CORPORATION_WALLET = 'esi-wallet.read_corporation_wallet.v1',
  SEARCH_SEARCH_STRUCTURES = 'esi-search.search_structures.v1',
  CLONES_READ_CLONES = 'esi-clones.read_clones.v1',
  CHARACTERS_READ_CONTACTS = 'esi-characters.read_contacts.v1',
  UNIVERSE_READ_STRUCTURES = 'esi-universe.read_structures.v1',
  BOOKMARKS_READ_CHARACTER_BOOKMARKS = 'esi-bookmarks.read_character_bookmarks.v1',
  KILLMAILS_READ_KILLMAILS = 'esi-killmails.read_killmails.v1',
  CORPORATIONS_READ_CORPORATION_MEMBERSHIP = 'esi-corporations.read_corporation_membership.v1',
  ASSETS_READ_ASSETS = 'esi-assets.read_assets.v1',
  PLANETS_MANAGE_PLANETS = 'esi-planets.manage_planets.v1',
  FLEETS_READ_FLEET = 'esi-fleets.read_fleet.v1',
  FLEETS_WRITE_FLEET = 'esi-fleets.write_fleet.v1',
  UI_OPEN_WINDOW = 'esi-ui.open_window.v1',
  UI_WRITE_WAYPOINT = 'esi-ui.write_waypoint.v1',
  CHARACTERS_WRITE_CONTACTS = 'esi-characters.write_contacts.v1',
  FITTINGS_READ_FITTINGS = 'esi-fittings.read_fittings.v1',
  FITTINGS_WRITE_FITTINGS = 'esi-fittings.write_fittings.v1',
  MARKETS_STRUCTURE_MARKETS = 'esi-markets.structure_markets.v1',
  CORPORATIONS_READ_STRUCTURES = 'esi-corporations.read_structures.v1',
  CHARACTERS_READ_LOYALTY = 'esi-characters.read_loyalty.v1',
  CHARACTERS_READ_OPPORTUNITIES = 'esi-characters.read_opportunities.v1',
  CHARACTERS_READ_CHAT_CHANNELS = 'esi-characters.read_chat_channels.v1',
  CHARACTERS_READ_MEDALS = 'esi-characters.read_medals.v1',
  CHARACTERS_READ_STANDINGS = 'esi-characters.read_standings.v1',
  CHARACTERS_READ_AGENTS_RESEARCH = 'esi-characters.read_agents_research.v1',
  INDUSTRY_READ_CHARACTER_JOBS = 'esi-industry.read_character_jobs.v1',
  MARKETS_READ_CHARACTER_ORDERS = 'esi-markets.read_character_orders.v1',
  CHARACTERS_READ_BLUEPRINTS = 'esi-characters.read_blueprints.v1',
  CHARACTERS_READ_CORPORATION_ROLES = 'esi-characters.read_corporation_roles.v1',
  LOCATION_READ_ONLINE = 'esi-location.read_online.v1',
  CONTRACTS_READ_CHARACTER_CONTRACTS = 'esi-contracts.read_character_contracts.v1',
  CLONES_READ_IMPLANTS = 'esi-clones.read_implants.v1',
  CHARACTERS_READ_FATIGUE = 'esi-characters.read_fatigue.v1',
  KILLMAILS_READ_CORPORATION_KILLMAILS = 'esi-killmails.read_corporation_killmails.v1',
  CORPORATIONS_TRACK_MEMBERS = 'esi-corporations.track_members.v1',
  WALLET_READ_CORPORATION_WALLETS = 'esi-wallet.read_corporation_wallets.v1',
  CHARACTERS_READ_NOTIFICATIONS = 'esi-characters.read_notifications.v1',
  CORPORATIONS_READ_DIVISIONS = 'esi-corporations.read_divisions.v1',
  CORPORATIONS_READ_CONTACTS = 'esi-corporations.read_contacts.v1',
  ASSETS_READ_CORPORATION_ASSETS = 'esi-assets.read_corporation_assets.v1',
  CORPORATIONS_READ_TITLES = 'esi-corporations.read_titles.v1',
  CORPORATIONS_READ_BLUEPRINTS = 'esi-corporations.read_blueprints.v1',
  BOOKMARKS_READ_CORPORATION_BOOKMARKS = 'esi-bookmarks.read_corporation_bookmarks.v1',
  CONTRACTS_READ_CORPORATION_CONTRACTS = 'esi-contracts.read_corporation_contracts.v1',
  CORPORATIONS_READ_STANDINGS = 'esi-corporations.read_standings.v1',
  CORPORATIONS_READ_STARBASES = 'esi-corporations.read_starbases.v1',
  INDUSTRY_READ_CORPORATION_JOBS = 'esi-industry.read_corporation_jobs.v1',
  MARKETS_READ_CORPORATION_ORDERS = 'esi-markets.read_corporation_orders.v1',
  CORPORATIONS_READ_CONTAINER_LOGS = 'esi-corporations.read_container_logs.v1',
  INDUSTRY_READ_CHARACTER_MINING = 'esi-industry.read_character_mining.v1',
  INDUSTRY_READ_CORPORATION_MINING = 'esi-industry.read_corporation_mining.v1',
  PLANETS_READ_CUSTOMS_OFFICES = 'esi-planets.read_customs_offices.v1',
  CORPORATIONS_READ_FACILITIES = 'esi-corporations.read_facilities.v1',
  CORPORATIONS_READ_MEDALS = 'esi-corporations.read_medals.v1',
  CHARACTERS_READ_TITLES = 'esi-characters.read_titles.v1',
  ALLIANCES_READ_CONTACTS = 'esi-alliances.read_contacts.v1',
  CHARACTERS_READ_FW_STATS = 'esi-characters.read_fw_stats.v1',
  CORPORATIONS_READ_FW_STATS = 'esi-corporations.read_fw_stats.v1',
}

export function tokenHasScopes(access_token: string, ...scopes: string[]) {
  const decoded = jwtDecode(access_token) as { scp: string[] | string; };
  let tokenScopes = typeof decoded.scp === 'string' ? [decoded.scp] : decoded.scp;
  return scopes.every((scope) => tokenScopes.includes(scope));
}
