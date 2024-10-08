import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { createActionRow, type Page } from '$discord';
import { PageKey, type CharacterContext } from '../characters.command';
import { AllianceAPI, CharacterAPI, CorporationAPI } from '$eve/esi';
import { format, formatDistanceToNow } from 'date-fns';

export function characterPage(key: string = PageKey.CHARACTER): Page<CharacterContext> {
  return {
    key,
    content: async (context: CharacterContext) => {
      const character = context.user.characters[context.characterIndex];
      const publicData = await CharacterAPI.getCharacterPublicData(character.id);
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
        .setThumbnail(CharacterAPI.getPortraitURL(character.id))
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
          text: `${context.characterIndex + 1}/${context.user.characters.length} -- id: ${character.id}${context.user.mainCharacter.id === character.id ? ' -- Main' : ''}`,
          iconURL: CharacterAPI.getPortraitURL(character.id),
        });

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
            context.user.mainCharacter.id !== character.id && {
              customId: PageKey.SET_MAIN,
              label: 'Set Main',
              style: ButtonStyle.Success,
            },
            { customId: PageKey.SCOPES, label: 'Scopes', style: ButtonStyle.Secondary },
            { label: 'Add', style: ButtonStyle.Link, url: `${global.App.config.baseUrl}/auth/${context.discordID}` },
          ),
        ],
        ephemeral: true,
      };
    },
  };
}
