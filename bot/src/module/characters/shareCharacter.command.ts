import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { type PageContent } from '@lib/discord';
import { characterPage } from './pages/character';
import {
  type User,
  UserHelper,
  CharacterHelper,
} from 'star-kitten-lib/db';
import { PageKey } from './characters.command';

const COMMAND = 'share-character';
export interface CharacterContext {
  characterIndex: number;
  user: User;
  discordID: string;
  disabled?: boolean;
  public?: boolean;
}

export const data = new SlashCommandBuilder()
  .setName(COMMAND)
  .setDescription('Post a basic character card to the channel for one of your authenticated characters')
  .addStringOption((option) => option.setName('name').setDescription('The character name to post').setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  if (interaction.isCommand()) {
    interaction = (await interaction.deferReply()).interaction as any;
  }

  const name = interaction.options.getString('name');
  const user = UserHelper.findByDiscordId(interaction.user.id);
  let character = CharacterHelper.findByName(user.id, name);
  if (!CharacterHelper.hasValidToken(character)) {
    character = await CharacterHelper.refreshTokens(character);
    if (!CharacterHelper.hasValidToken(character)) {
      await interaction.editReply({
        content: `Sorry, I was unable to refresh the token for **${character.name}**. Please re-authenticate with the \`/characters\` command.`,
      });
      return PageKey.CHARACTER;
    }
  }

  const page = await characterPage(PageKey.CHARACTER).content({
    characterIndex: 0,
    user,
    character,
    discordID: interaction.user.id,
    public: true,
  }) as PageContent;

  await interaction.editReply({
    content: `<@${interaction.user.id}> shared character card for **${character.name}**`,
    embeds: [
      page.embeds[0],
    ],
  });
}
