import { getCookies } from '@utils';
import type { RequestContext } from 'brisa';
import { User } from 'star-kitten-lib/db';
import { esi } from 'star-kitten-lib/eve';
import SkillQueueStat from '@components/stats/skill-queue';
import WalletStat from '@components/stats/wallet';

export default function Homepage(props: any, request: RequestContext) {

  const cookies = getCookies(request.headers);
  const userId = cookies.currentUser;
  if (!userId) {
    throw new Error('No user found');
  }

  const user = User.find(Number(userId));
  const character = user.mainCharacter;

  return (
    <>
      <div class="bg-gray-900 py-24 sm:py-32">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="mx-auto max-w-2xl lg:max-w-none">
            <div class="stats shadow">
              <div class="stat">
                <div class="stat-figure text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-8 w-8 stroke-current">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="stat-title">Characters</div>
                <div class="stat-value">{user.characters.length}</div>
                <div class="stat-desc">Jan 1st - Feb 1st</div>
              </div>

              <SkillQueueStat character={character!} />

              <WalletStat character={character!} />

              <div class="stat">
                <div class="stat-figure text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-8 w-8 stroke-current">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                  </svg>
                </div>
                <div class="stat-title">New Registers</div>
                <div class="stat-value">1,200</div>
                <div class="stat-desc">↘︎ 90 (14%)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
