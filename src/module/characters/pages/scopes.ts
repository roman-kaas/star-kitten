import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { type Page, WHITE_SPACE, createActionRow } from '$discord';
import type { AppModule } from '$lib/StarKitten';
import { PageKey, type CharacterContext } from '../characters.command';

export function scopesPage(key: string = 'scopes'): Page<CharacterContext> {
  return {
    key,
    content: async (context: CharacterContext) => {
      const character = context.user.characters[context.characterIndex];
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
        scopesText += `### ${module.name} Module\n`;
        scopesText += `*${module.description}* ` + '```' + moduleScopes.join('\n') + '```\n';
        scopesText += character.hasAllScopes(moduleScopes)
          ? `:white_check_mark: You have all scopes! - [Remove ${module.name} Scopes](${removeScopesUrl(context.user.discordID, character.id, module.name).href})\n\n`
          : `:x: You are missing required scopes - [Add ${module.name} Scopes](${addScopesUrl(context.user.discordID, character.id, module.name).href})\n`;

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
            !character.isOnlyPublicScope && {
              customId: PageKey.CONFIRM_REVOKE_SCOPES,
              label: 'Revoke All Scopes',
              style: ButtonStyle.Danger,
            },
            { customId: PageKey.CONFIRM_DELETE, label: 'Logout', style: ButtonStyle.Danger },
          ),
        ],
        ephemeral: true,
      };
    },
  };
}

function addScopesUrl(discordID: string, characterID: number, moduleName: string) {
  return new URL(`${global.App.baseUrl}/auth/${discordID}/addScopes/${characterID}/${moduleName}`);
}

function removeScopesUrl(discordID: string, characterID: number, moduleName: string) {
  return new URL(`${global.App.baseUrl}/auth/${discordID}/removeScopes/${characterID}/${moduleName}`);
}
