import { ActionRowBuilder, ChatInputCommandInteraction, MessageComponentInteraction, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { janice } from "$eve/thirdParty";
import { formatNumberToShortForm } from "$lib/discord/utils/text";

export const data = new SlashCommandBuilder()
  .setName('appraise')
  .setDescription('Appraise items using Janice')
  .addNumberOption(option =>
    option.setName('market')
      .setDescription('The market to appraise in')
      .setRequired(true)
      .addChoices(janice.markets.map(m => ({ name: m.name, value: m.id })))
  );

export async function execute(interaction: ChatInputCommandInteraction) {

  const modalId = `appraise_${interaction.user.id}`;
  const modal = new ModalBuilder()
    .setCustomId(modalId)
    .setTitle('Appraisal - Powered by Janice');

  const appraisalInput = new TextInputBuilder()
    .setCustomId('items')
    .setLabel('Items')
    .setPlaceholder('Enter items to appraise')
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);

  const row = new ActionRowBuilder().addComponents(appraisalInput);
  modal.addComponents(row as any);
  await interaction.showModal(modal);


  try {
    const submitInteraction = await interaction.awaitModalSubmit({
      time: 60000,
      filter: i => i.customId === modalId && i.user.id === interaction.user.id,
    });
    submitInteraction.deferReply();

    const items = submitInteraction.fields.getTextInputValue('items');
    const market = interaction.options.getNumber('market') ?? 2;
    const appraisal = await janice.appraiseItems(items, market);
    await submitInteraction.editReply({
      content: `Appraisal results: <https://janice.e-351.com/a/${appraisal.code}>
- Buy: ${formatter.format(appraisal.effectivePrices.totalBuyPrice)} ISK
- Split: ${formatter.format(appraisal.effectivePrices.totalSplitPrice)} ISK
- Sell: ${formatter.format(appraisal.effectivePrices.totalSellPrice)} ISK
- Volume: ${formatter.format(appraisal.totalVolume)} m³
- Packaged Volume: ${formatter.format(appraisal.totalPackagedVolume)} m³
- Priced at: ${appraisal.market.name}\n` +

        '```Item -- buy | split | sell\n' +
        appraisal.items.map(i => `${i.itemType.name} x${i.amount} -- ${formatter.format(i.effectivePrices.buyPrice)} | ${formatter.format(i.effectivePrices.splitPrice)} | ${formatter.format(i.effectivePrices.sellPrice)}`).join('\n') +
        '```',
    });
  } catch (error) {
    await interaction.followUp({
      content: 'You failed to provide items to appraise within the 60 second time limit. Please, try again.',
      ephemeral: true
    });
  }
}

const formatter = new Intl.NumberFormat('en-US');
