import { type Character } from 'star-kitten-lib/db';
import { calculateTrainingPercentage, esi, getSkill, getType } from 'star-kitten-lib/eve';

export default async function SkillQueueStat({
  character,
}: {
  character: Character;
}) {

  const queue = await esi.getCharacterSkillQueue(character);
  const current = queue?.find((skill) => skill.queue_position === 0);
  if (!current || !current.start_date) {
    return (
      <div class="stat">
        <div class="stat-figure text-secondary">
        </div>
        <div class="stat-title">No Skills Training</div>
      </div >
    );
  }

  const skill = getSkill(current.skill_id);
  const percentage = calculateTrainingPercentage(current) * 100;
  return (
    <div class="stat">
      <div class="stat-figure text-secondary">
      </div>
      <div class="stat-title">Currently Training</div>
      <div class="stat-value">{getType(skill.type_id).name.en} {current.finished_level}</div>
      <div class="stat-desc"><progress class="progress progress-primary w-full" value={percentage} max="100"></progress></div>
    </div>
  );
}

SkillQueueStat.suspense = () => (
  <div class="stat">
    <div class="stat-figure text-secondary">
    </div>
    <div class="stat-title">Currently Training</div>
    <div class="flex w-52 flex-col gap-4">
      <div class="skeleton h-16 w-full"></div>
      <div class="skeleton h-4 w-full"></div>
    </div>
  </div>
)