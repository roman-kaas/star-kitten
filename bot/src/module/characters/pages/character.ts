import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { coloredText, createActionRow, type Page } from '@lib/discord';
import { PageKey, type CharacterContext } from '../characters.command';
import { AllianceAPI, CharacterAPI, CorporationAPI } from 'star-kitten-lib/eve';
import { format, formatDistanceToNow } from 'date-fns';

export function characterPage(key: string = PageKey.CHARACTER): Page<CharacterContext> {
  return {
    key,
    content: async (context: CharacterContext) => {
      const character = context.user.characters[context.characterIndex];
      const publicData = await CharacterAPI.getCharacterPublicData(character.eveID);
      const corporation = await CorporationAPI.getCorporationData(publicData.corporation_id);
      const alliance = publicData.alliance_id ? await AllianceAPI.getAllianceData(publicData.alliance_id) : null;

      const embed = new EmbedBuilder()
        .setAuthor({
          name: alliance ? alliance.name : corporation.name,
          iconURL: alliance
            ? (await AllianceAPI.getAllianceIcons(publicData.alliance_id)).px64x64
            : (await CorporationAPI.getCorporationIcons(publicData.corporation_id)).px64x64,
        })
        .setTitle(character.name)
        .setURL(`https://zkillboard.com/character/${character.eveID}/`)
        .setThumbnail(CharacterAPI.getPortraitURL(character.eveID))
        .addFields(
          {
            name: 'Birthday',
            value: format(new Date(publicData.birthday), 'd MMM yyy'),
            inline: true,
          },
          {
            name: 'Age',
            value: formatDistanceToNow(new Date(publicData.birthday)),
            inline: true,
          },
          {
            name: 'Security Status',
            value: publicData.security_status.toFixed(2) + '',
            inline: true,
          },
          { name: 'Corporation', value: corporation.name, inline: true },
          {
            name: 'Alliance',
            value: alliance ? alliance.name : 'N/A',
            inline: true,
          },
        )
        .setFooter({
          text: `${context.characterIndex + 1}/${context.user.characters.length} -- id: ${character.eveID}${context.user.mainCharacter?.id === character.id ? ' -- Main' : ''}`,
          iconURL: CharacterAPI.getPortraitURL(character.eveID),
        });
      
      if (!character.validToken) {
        embed.setColor('Red').setDescription( coloredText('This character has an invalid token. Please reauthenticate.', 'red'));
      }

      return {
        type: 'page',
        embeds: [embed],
        components: [
          createActionRow(
            { customId: PageKey.PREV, label: 'Previous', disabled: context.characterIndex === 0 },
            {
              customId: PageKey.NEXT,
              label: 'Next',
              disabled: context.characterIndex === context.user.characters.length - 1,
            },
            character.validToken && context.user.mainCharacter?.id !== character.id && {
              customId: PageKey.SET_MAIN,
              label: 'Set Main',
              style: ButtonStyle.Success,
            },
            character.validToken && { customId: PageKey.SCOPES, label: 'Scopes', style: ButtonStyle.Secondary },
            character.validToken && { label: 'Add', style: ButtonStyle.Link, url: `${global.App.config.baseUrl}/api/auth/discordID/${context.discordID}` },

            // invalid token, so show reauth and logout
            !character.validToken && { label: 'Reauthenticate', style: ButtonStyle.Link, url: `${global.App.config.baseUrl}/api/auth/discordID/${context.discordID}/characterID/${character.eveID}/scopes/${character.scopes.join(' ')}` },
            !character.validToken && { customId: PageKey.CONFIRM_DELETE, label: 'remove', style: ButtonStyle.Danger }
          ),
        ],
        ephemeral: true,
      };
    },
  };
}
