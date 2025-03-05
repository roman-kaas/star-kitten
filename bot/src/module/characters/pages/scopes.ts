import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { type Page, WHITE_SPACE, createActionRow } from '@lib/discord';
import type { AppModule } from '@lib/StarKitten';
import { PageKey, type CharacterContext } from '../characters.command';
import { CharacterHelper } from 'star-kitten-lib/db';

export function scopesPage(key: string = 'edit'): Page<CharacterContext> {
  return {
    key,
    content: async (context: CharacterContext) => {
      const character = context.character;
      let description = WHITE_SPACE;

      // get modules, check if each module has the required scopes, list scopes per module and a link to add scopes if missing
      // and a link to remove scopes if present
      const embeds = [];
      let embed = new EmbedBuilder().setTitle('Scopes');

      const modules = Array.from(global.App.modules.values()).filter((module) => module.scopes) as AppModule[];
      for (const module of modules) {
        const moduleScopes = module.scopes.split(' ');
        if (moduleScopes.length === 0 || (moduleScopes.length === 1 && moduleScopes[0] === 'publicData')) {
          continue;
        }
        let scopesText = '';
        scopesText += `### ${module.name}\n`;
        scopesText += `*${module.description}* \n`;
        // scopesText += '```' + moduleScopes.join('\n') + '```\n';
        scopesText += CharacterHelper.hasAllScopes(character, moduleScopes)
          ? `:white_check_mark: You have all scopes!\n[Remove ${module.name} Scopes](${new URL(`${global.App.baseUrl}/api/auth/discordID/${context.user.discordID}/removeScopes/characterID/${character.eveID}/scopes/${moduleScopes.join(',')}`).href})\n\n`
          : `:x: You are missing required scopes\n[Add ${module.name} Scopes](${new URL(`${global.App.baseUrl}/api/auth/discordID/${context.user.discordID}/addScopes/characterID/${character.eveID}/scopes/${moduleScopes.join(',')}`).href})\n`;

        if (scopesText.length + description.length < 4096) {
          description += scopesText;
        } else {
          embed.setDescription(description);
          embeds.push(embed);
          embed = new EmbedBuilder();
          description = scopesText;
        }
      }

      embed.setDescription(description);
      embeds.push(embed.setFooter({ text: 'run the /characters command again to view any changes made' }));

      return {
        type: 'page',
        embeds,
        components: [
          createActionRow(
            { customId: PageKey.CHARACTER, label: 'Back' },
            { customId: PageKey.EDIT, style: ButtonStyle.Secondary, label: 'Refresh' },
            CharacterHelper.hasValidToken(character) && context.user.mainCharacterID !== character.id && {
              customId: PageKey.SET_MAIN,
              label: 'Set as Main',
              style: ButtonStyle.Success,
            },
            !CharacterHelper.hasOnlyPublicScope(character) && {
              customId: PageKey.CONFIRM_REVOKE_SCOPES,
              label: 'Revoke All Scopes',
              style: ButtonStyle.Danger,
            },
            { customId: PageKey.CONFIRM_DELETE, label: 'Delete', style: ButtonStyle.Danger },
          ),
        ],
        ephemeral: true,
      };
    },
  };
}
