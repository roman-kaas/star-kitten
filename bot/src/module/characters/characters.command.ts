import { SlashCommandBuilder, CommandInteraction, MessageFlags } from 'discord.js';
import { useNavigation, confirmationPage, type Page, type ResumeableInteraction } from '@lib/discord';
import { scopesPage } from './pages/scopes';
import { characterPage } from './pages/character';
import { emptyPage } from './pages/empty';
import {
  type Character,
  ResumeCommand,
  type User,
  UserHelper,
  CharacterHelper,
} from 'star-kitten-lib/db';

const COMMAND = 'characters';
export interface CharacterContext {
  characterIndex: number;
  user: User;
  character?: Character;
  discordID: string;
  disabled?: boolean;
  public?: boolean;
}

export const data = new SlashCommandBuilder()
  .setName(COMMAND)
  .setDescription('Manage your characters');

export const enum PageKey {
  EMPTY = 'empty', // when no user exists or no characters are found for a user
  CHARACTER = 'character', // show character information
  NEXT = 'next', // show next character
  PREV = 'prev', // show previous character
  EDIT = 'edit', // scope management
  CONFIRM_DELETE = 'confirm-delete', // show confirmation to delete character
  CANCEL = 'cancel', // go back to characer page
  DELETE = 'delete', // delete the current character
  CONFIRM_REVOKE_SCOPES = 'confirm-revoke-scopes', // show confirmation to revoke all scopes
  CANCEL_SCOPES = 'cancel-scopes', // go back to scopes page
  REVOKE_NONPUBLIC_SCOPES = 'revoke-nonpublic-scopes', // revoke all non-public scopes
  REFRESH = 'refresh', // refresh the user data
  SET_MAIN = 'set-main', // set the main character
}

export async function execute(interaction: CommandInteraction) {
  renderCharacters(interaction);
}

export async function resume(interaction: ResumeableInteraction, params: any, context: any) {
  renderCharacters(interaction, context);
}

async function renderCharacters(interaction: CommandInteraction | ResumeableInteraction, context: any = {}) {
  if (interaction.isCommand()) {
    interaction = (await interaction.deferReply({ flags: MessageFlags.Ephemeral })).interaction as any;
  }

  const user = UserHelper.findByDiscordId(interaction.user.id);
  context.user = user;

  const pages: Page<CharacterContext>[] = [
    emptyPage(PageKey.EMPTY),
    characterPage(PageKey.CHARACTER),
    scopesPage(PageKey.EDIT),
    confirmationPage({
      key: PageKey.CONFIRM_DELETE,
      title: 'Remove Character',
      messageBuilder: (context: CharacterContext) => {
        const character = UserHelper.getCharacter(user, context.characterIndex);
        return `Are you sure you want to delete ${character.name}?\n\nThis will remove all tokens and data associated with this character.`;
      },
      cancelKey: PageKey.CANCEL,
      confirmKey: PageKey.DELETE,
    }),
    confirmationPage({
      key: PageKey.CONFIRM_REVOKE_SCOPES,
      title: 'Revoke All Scopes',
      messageBuilder: (context: CharacterContext) => {
        const character = UserHelper.getCharacter(user, context.characterIndex);
        return `Are you sure you want to remove all scopes for ${character.name}?`;
      },
      cancelKey: PageKey.CANCEL_SCOPES,
      confirmKey: PageKey.REVOKE_NONPUBLIC_SCOPES,
    }),
  ];

  const updateContext = async (key: string, context: CharacterContext) => {

    const refreshUser = () => context.user = UserHelper.findByDiscordId(interaction.user.id);
    context.character = await getAndRefreshCharacter(context);

    switch (key) {
      case PageKey.NEXT:
        context.characterIndex++;
        context.character = await getAndRefreshCharacter(context);
        return PageKey.CHARACTER;
      case PageKey.PREV:
        context.characterIndex--;
        context.character = await getAndRefreshCharacter(context);
        return PageKey.CHARACTER;
      case PageKey.CANCEL:
        return PageKey.CHARACTER;
      case PageKey.CANCEL_SCOPES:
        return PageKey.EDIT;
      case PageKey.REVOKE_NONPUBLIC_SCOPES: {
        const character = UserHelper.getCharacter(user, context.characterIndex);
        await CharacterHelper.refreshTokens(character, 'publicData');
        return PageKey.CHARACTER;
      }
      case PageKey.REFRESH: {
        refreshUser();
        return PageKey.CHARACTER;
      }
      case PageKey.DELETE: {
        const character = UserHelper.getCharacter(user, context.characterIndex);
        CharacterHelper.delete(character);
        delete user.characterIDs[context.characterIndex];
        context.characterIndex = Math.max(0, context.characterIndex - 1);
        if (user.mainCharacterID === character.id) {
          // set main to next character if there are any, or null
          user.mainCharacterID = UserHelper.getCharacter(user, context.characterIndex).id ?? null;
          UserHelper.save(user);
        }
        refreshUser();
        return user.characterIDs.length === 0 ? PageKey.EMPTY : PageKey.CHARACTER;
      }
      case PageKey.SET_MAIN: {
        const character = UserHelper.getCharacter(user, context.characterIndex);
        user.mainCharacterID = character.id;
        UserHelper.save(user);
        refreshUser();
        return PageKey.CHARACTER;
      }
      default:
        context.character = await getAndRefreshCharacter(context);
        refreshUser();
        return key;
    }
  };

  let ctx = {
    characterIndex: 0,
    user,
    discordID: interaction.user.id,
    ...context,
  }

  useNavigation({
    interaction,
    pages,
    key: !user || !user.characterIDs || user.characterIDs.length === 0 ? PageKey.EMPTY : PageKey.CHARACTER,
    context: ctx,
    updateContext,
    saveResume: (messageId, context) => {
      ResumeCommand.create(messageId, COMMAND, {}, { characterIndex: context.characterIndex }).save();
    },
  });
}

export async function getAndRefreshCharacter({ user, character, characterIndex }: CharacterContext) {
  if (!user || !user.characterIDs || user.characterIDs.length === 0) {
    return;
  }
  character = UserHelper.getCharacter(user, characterIndex);
  if (!CharacterHelper.hasValidToken(character)) {
    await CharacterHelper.refreshTokens(character);
    return UserHelper.getCharacter(user, characterIndex);
  }
  character = character;
  return character;
};
