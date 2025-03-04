import { esiFetch } from './fetch';

// PUBLIC APIS ---------------------------------------------------------------

interface AllianceData {
  creator_corporation_id: number;
  creator_id: number;
  date_founded: string;
  executor_corporation_id: number;
  faction_id: number;
  name: string;
  ticker: string;
}

export async function getAllianceData(id: number) {
  return await esiFetch<Partial<AllianceData>>(`/alliances/${id}/`);
}

export async function getAllianceCorporations(id: number) {
  return await esiFetch<number[]>(`/alliances/${id}/corporations/`);
}

interface AllianceIcons {
  px128x128: string;
  px64x64: string;
}

export async function getAllianceIcons(id: number) {
  return await esiFetch<Partial<AllianceIcons>>(`/alliances/${id}/icons/`);
}
