import { renderComponent } from 'brisa/server';
import { type Character } from 'star-kitten-lib/db';
import { esi } from 'star-kitten-lib/eve';
import { formatNumberToShortForm } from 'star-kitten-lib';

export default async function WalletStat({
  character,
}: {
  character: Character;
}) {

  const balance = await esi.CharacterAPI.getCharacterWallet(character) || 0;
  const journal = await esi.CharacterAPI.getCharacterWalletJournal(character, 1);
  // get earliest transaction today from list of journal transactionsbun d
  const earliestTransaction = journal?.filter((transaction) => {
    const date = new Date(transaction.date!);
    return date.getDate() === new Date().getDate();
  }).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0];

  const balanceChange = balance - (earliestTransaction?.balance || balance);
  const balanceChangePercentage = (balanceChange / (earliestTransaction?.balance || balance)) * 100;
  const balanceChangeDirection = balanceChange > 0 ? '↗︎' : '↘︎';
  const balanceChangeText = `${balanceChangeDirection} ${formatNumberToShortForm(Math.abs(balanceChange))} (${Math.abs(Number(balanceChangePercentage.toFixed(2)))}%)`;

  return (
    <div class="stat">
      <div class="stat-figure text-secondary">
      </div>
      <div class="stat-title">Wallet</div>
      <div class="stat-value">{formatNumberToShortForm(balance)} ISK</div>
      <div class="stat-desc">{balanceChangeText}</div>
    </div>
  );
}

WalletStat.suspense = () => (
  <div class="stat">
    <div class="stat-figure text-secondary">
    </div>
    <div class="stat-title">Wallet</div>
    <div class="flex w-52 flex-col gap-4">
      <div class="skeleton h-16 w-full"></div>
      <div class="skeleton h-4 w-full"></div>
    </div>
  </div>
)