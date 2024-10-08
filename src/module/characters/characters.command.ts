import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { useNavigation, confirmationPage, type Page } from '$discord';
import { db, refreshTokenAndUpdateCharacter, User } from '$module/auth';
import { scopesPage } from './pages/scopes';
import { characterPage } from './pages/character';
import { emptyPage } from './pages/empty';

export interface CharacterContext {
  characterIndex: number;
  user: User;
  discordID: string;
  disabled?: boolean;
}

export const data = new SlashCommandBuilder().setName('characters').setDescription('Manage your characters');

export const enum PageKey {
  EMPTY = 'empty', // when no user exists or no characters are found for a user
  CHARACTER = 'character', // show character information
  NEXT = 'next', // show next character
  PREV = 'prev', // show previous character
  SCOPES = 'scopes', // scope management
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
  let deferred = await interaction.deferReply({ ephemeral: true });

  const user = db.getUserByDiscordId(interaction.user.id);

  const pages: Page<CharacterContext>[] = [
    emptyPage(PageKey.EMPTY),
    characterPage(PageKey.CHARACTER),
    scopesPage(PageKey.SCOPES),
    confirmationPage({
      key: PageKey.CONFIRM_DELETE,
      title: 'Remove Character',
      messageBuilder: (context: CharacterContext) => {
        const character = context.user.characters[context.characterIndex];
        return `Are you sure you want to logout ${character.name}?\n\nThis will remove all tokens and data associated with this character.`;
      },
      cancelKey: PageKey.CANCEL,
      confirmKey: PageKey.DELETE,
    }),
    confirmationPage({
      key: PageKey.CONFIRM_REVOKE_SCOPES,
      title: 'Revoke All Scopes',
      messageBuilder: (context: CharacterContext) => {
        const character = context.user.characters[context.characterIndex];
        return `Are you sure you want to remove all scopes for ${character.name}?`;
      },
      cancelKey: PageKey.CANCEL_SCOPES,
      confirmKey: PageKey.REVOKE_NONPUBLIC_SCOPES,
    }),
  ];

  const updateContext = async (key: string, context: CharacterContext) => {
    const refresh = () => db.getUserByDiscordId(interaction.user.id);
    switch (key) {
      case PageKey.NEXT:
        context.characterIndex++;
        return PageKey.CHARACTER;
      case PageKey.PREV:
        context.characterIndex--;
        return PageKey.CHARACTER;
      case PageKey.CANCEL:
        return PageKey.CHARACTER;
      case PageKey.CANCEL_SCOPES:
        return PageKey.SCOPES;
      case PageKey.REVOKE_NONPUBLIC_SCOPES: {
        const character = context.user.characters[context.characterIndex];
        await refreshTokenAndUpdateCharacter(character.id, 'publicData');
        context.user = refresh();
        return PageKey.CHARACTER;
      }
      case PageKey.REFRESH: {
        context.user = refresh();
        return PageKey.CHARACTER;
      }
      case PageKey.DELETE: {
        const character = context.user.characters[context.characterIndex];
        db.deleteModel(character);
        context.characterIndex = Math.max(0, context.characterIndex - 1);
        if (context.user.mainCharacter?.id === character.id) {
          // set main to next character if there are any, or null
          context.user.mainCharacter = context.user.characters[context.characterIndex] ?? null;
          db.save(context.user);
          context.user = refresh();
        }
        return context.user.characters.length === 0 ? PageKey.EMPTY : PageKey.CHARACTER;
      }
      case PageKey.SET_MAIN: {
        const character = context.user.characters[context.characterIndex];
        context.user.mainCharacter = character;
        db.save(context.user);
        context.user = refresh();
        return PageKey.CHARACTER;
      }
      default:
        return key;
    }
  };

  useNavigation({
    interaction: deferred.interaction as any,
    pages,
    key: !user || user.characters.length === 0 ? PageKey.EMPTY : PageKey.CHARACTER,
    context: {
      characterIndex: 0,
      user,
      discordID: interaction.user.id,
    },
    updateContext,
  });
}
