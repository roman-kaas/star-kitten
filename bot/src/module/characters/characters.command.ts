import { SlashCommandBuilder, CommandInteraction, MessageFlags } from 'discord.js';
import { useNavigation, confirmationPage, type Page, type ResumeableInteraction } from '@lib/discord';
import { scopesPage } from './pages/scopes';
import { characterPage } from './pages/character';
import { emptyPage } from './pages/empty';
import { ResumeCommand, User } from 'star-kitten-lib/db';

const COMMAND = 'characters';
export interface CharacterContext {
  characterIndex: number;
  user: User;
  discordID: string;
  disabled?: boolean;
}

export const data = new SlashCommandBuilder().setName(COMMAND).setDescription('Manage your characters');

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
  renderCharacters(interaction);
}

export async function resume(interaction: ResumeableInteraction, params: any, context: any) {
  renderCharacters(interaction, context);
}

async function renderCharacters(interaction: CommandInteraction | ResumeableInteraction, context: any = {}) {
  if (interaction.isCommand()) {
    interaction = (await interaction.deferReply({ flags: MessageFlags.Ephemeral })).interaction as any;
  }

  const user = User.findByDiscordId(interaction.user.id);

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
    
    const refreshUser = () => context.user = User.findByDiscordId(interaction.user.id);
    
    const getAndRefreshCharacter = async () => {
      if (!context.user ||!context.user.characters || context.user.characters.length === 0) {
        return;
      }
      const character = context.user.characters[context.characterIndex];
      if (!character.validToken) {
        await character.refreshTokens();
        return context.user.characters[context.characterIndex];
      }
      return character;
    };

    switch (key) {
      case PageKey.NEXT: 
        context.characterIndex++;
        await getAndRefreshCharacter();
        return PageKey.CHARACTER;
      case PageKey.PREV: 
        context.characterIndex--;
        await getAndRefreshCharacter();
        return PageKey.CHARACTER;
      case PageKey.CANCEL:
        return PageKey.CHARACTER;
      case PageKey.CANCEL_SCOPES:
        return PageKey.SCOPES;
      case PageKey.REVOKE_NONPUBLIC_SCOPES: {
        const character = context.user.characters[context.characterIndex];
        await character.refreshTokens('publicData');
        return PageKey.CHARACTER;
      }
      case PageKey.REFRESH: {
        refreshUser();
        return PageKey.CHARACTER;
      }
      case PageKey.DELETE: {
        const character = context.user.characters[context.characterIndex];
        character.delete();
        delete user.characters[context.characterIndex];
        context.characterIndex = Math.max(0, context.characterIndex - 1);
        if (context.user.mainCharacter?.id === character.id) {
          // set main to next character if there are any, or null
          context.user.mainCharacter = context.user.characters[context.characterIndex] ?? null;
          user.save();
          refreshUser();
        }
        return context.user.characters.length === 0 ? PageKey.EMPTY : PageKey.CHARACTER;
      }
      case PageKey.SET_MAIN: {
        const character = context.user.characters[context.characterIndex];
        context.user.mainCharacter = character;
        context.user.save();
        refreshUser();
        return PageKey.CHARACTER;
      }
      default:
        await getAndRefreshCharacter();
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
    key: !user || !user.characters || user.characters.length === 0 ? PageKey.EMPTY : PageKey.CHARACTER,
    context: ctx,
    updateContext,
    saveResume: (messageId, context) => {
      ResumeCommand.create(messageId, COMMAND, {}, { characterIndex: context.characterIndex }).save();
    },
  });
}
