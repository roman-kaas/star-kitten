import type { EveTokens } from './auth';
import { esiFetch } from './fetch';
import { tokenHasScopes } from './scopes';

export interface CharacterAttributes {
  charisma: number;
  intelligence: number;
  memory: number;
  perception: number;
  willpower: number;
  last_remap_date?: string;
  bonus_remaps?: number;
  accrued_remap_cooldown_date?: string;
}

// required scope: esi-skills.read_skills.v1
export function getCharacterAttributes(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-skills.read_skills.v1')) return null;
  return esiFetch<CharacterAttributes>(`/characters/${id}/attributes`, token);
}

export interface SkillQueueItem {
  finish_date?: string;
  finished_level: number;
  level_end_sp?: number;
  level_start_sp?: number;
  queue_position: number;
  skill_id: number;
  start_date?: string;
  training_start_sp?: number;
}

// required scope: esi-skills.read_skillqueue.v1
export function getCharacterSkillQueue(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-skills.read_skillqueue.v1')) return null;
  return esiFetch<SkillQueueItem[]>(`/characters/${id}/skillqueue`, token);
}

export interface Skill {
  active_skill_level: number;
  skill_id: number;
  skillpoints_in_skill: number;
  trained_skill_level: number;
}

export interface CharacterSkills {
  skills: Skill[]; // max 1000
  total_sp: number;
  unallocated_sp?: number;
}

// required scope: esi-skills.read_skills.v1
export function getCharacterSkills(id: number, token: EveTokens) {
  if (!tokenHasScopes(token.access_token, 'esi-skills.read_skills.v1')) return null;
  return esiFetch<CharacterSkills>(`/characters/${id}/skills`, token);
}
