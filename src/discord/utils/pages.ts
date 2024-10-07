import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import type { Page } from "./navigation";


interface ConfirmationPage {
  key: string;
  title: string;
  messageBuilder: (context: any) => string;
  cancelKey: string;
  confirmKey: string;
}

export function confirmationPage<T>(page: ConfirmationPage): Page<T> {
  return {
    key: page.key,
    content: async (context: any) => {
      const embed = new EmbedBuilder()
        .setTitle(page.title)
        .setDescription(page.messageBuilder(context))
        .setColor(0xff0000);

      return {
        type: 'page',
        embeds: [embed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(page.cancelKey).setLabel('Cancel').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(page.confirmKey).setLabel('Confirm').setStyle(ButtonStyle.Danger),
          ),
        ],
        ephemeral: true,
      };
    },
  };
}
