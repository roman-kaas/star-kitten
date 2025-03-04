import type { Character } from '@db/models';
import { esiFetch } from './fetch';

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
export function getCharacterAttributes(character: Character) {
  if (!character.hasScope('esi-skills.read_skills.v1')) return null;
  return esiFetch<CharacterAttributes>(`/characters/${character.eveID}/attributes`, character);
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
export function getCharacterSkillQueue(character: Character) {
  if (!character.hasScope('esi-skills.read_skillqueue.v1')) return null;
  return esiFetch<SkillQueueItem[]>(`/characters/${character.eveID}/skillqueue`, character);
}

export interface APISkill {
  active_skill_level: number;
  skill_id: number;
  skillpoints_in_skill: number;
  trained_skill_level: number;
}

export interface CharacterSkills {
  skills: APISkill[]; // max 1000
  total_sp: number;
  unallocated_sp?: number;
}

// required scope: esi-skills.read_skills.v1
export function getCharacterSkills(character: Character) {
  if (!character.hasScope('esi-skills.read_skills.v1')) return null;
  return esiFetch<CharacterSkills>(`/characters/${character.eveID}/skills`, character);
}

export function calculateTrainingPercentage(queuedSkill: SkillQueueItem) {
  // percentage in when training started
  const trainingStartPosition = (queuedSkill.training_start_sp! - queuedSkill.level_start_sp!) / queuedSkill.level_end_sp!;
  // percentage completed between start and now
  const timePosition = (new Date().getTime() - new Date(queuedSkill.start_date!).getTime()) / (new Date(queuedSkill.finish_date!).getTime() - new Date(queuedSkill.start_date!).getTime());
  // percentage completed
  return (trainingStartPosition + (1 - trainingStartPosition) * timePosition);
}