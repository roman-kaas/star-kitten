import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, MessageComponentInteraction, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { janice } from "$eve/thirdParty";
import { renderThreeColumns, renderThreeTitledColumns } from "$lib/discord";

export const data = new SlashCommandBuilder()
  .setName('appraise')
  .setNameLocalizations({ 'en-US': 'appraise', 'es-ES': 'evaluar' })
  .setDescriptionLocalizations({ 'en-US': 'Appraise items using Janice', 'es-ES': 'Evalúa objetos usando Janice' })
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

    const embed = new EmbedBuilder()
      .setTitle(`Appraisal - ${appraisal.market.name}`)
      .setURL(`https://janice.e-351.com/a/${appraisal.code}`)
      .setColor('DarkGold')
      .setFooter({ text: `Powered by Janice` })
      .addFields(
        { name: 'Total Buy', value: formatter.format(appraisal.effectivePrices.totalBuyPrice), inline: true },
        { name: 'Total Split', value: formatter.format(appraisal.effectivePrices.totalSplitPrice), inline: true },
        { name: 'Total Sell', value: formatter.format(appraisal.effectivePrices.totalSellPrice), inline: true },
        { name: 'Total Volume', value: formatter.format(appraisal.totalPackagedVolume), inline: false },
        ...renderThreeTitledColumns({
          col1: {
            title: 'Item',
            values: appraisal.items.map(i => `${i.itemType.name} x ${i.amount}`)
          },
          col2: {
            title: 'Buy',
            values: appraisal.items.map(i => formatter.format(i.effectivePrices.buyPriceTotal))
          },
          col3: {
            title: 'Sell',
            values: appraisal.items.map(i => formatter.format(i.effectivePrices.sellPriceTotal))
          }
        }
        )
      );
    await submitInteraction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.followUp({
      content: 'You failed to provide items to appraise within the 60 second time limit. Please, try again.',
      ephemeral: true
    });
  }
}

const formatter = new Intl.NumberFormat('en-US');
