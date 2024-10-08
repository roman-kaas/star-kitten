import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { createActionRow, type Page } from '$discord';
import { PageKey, type CharacterContext } from '../characters.command';

export function emptyPage(key: string = PageKey.EMPTY): Page<CharacterContext> {
  return {
    key,
    content: async (context: CharacterContext) => {
      const embed = new EmbedBuilder()
        .setTitle('Hey there!')
        .setDescription(
          `
          Sadly, I don't have any authenticated characters for you. But that is an easy fix for that!\n
          Please, click the "Add" button below to add a character to get started.\n
          Once you have authenticated, you may view your character by running the \`/characters\` command again.
        `,
        )
        .setColor('Blue')
        .setThumbnail('https://s6.imgcdn.dev/FiX5h.png');

      return {
        type: 'page',
        embeds: [embed],
        components: [
          createActionRow({
            label: 'Add',
            style: ButtonStyle.Link,
            url: `${global.App.config.baseUrl}/auth/${context.discordID}`,
          }),
        ],
        ephemeral: true,
      };
    },
  };
}
