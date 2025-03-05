import { ButtonStyle, EmbedBuilder } from 'discord.js';
import { coloredText, createActionRow, WHITE_SPACE, type Page } from '@lib/discord';
import { PageKey, type CharacterContext } from '../characters.command';
import { AllianceAPI, calculateTrainingPercentage, CharacterAPI, CorporationAPI, esi, getSolarSystem, getType, SCOPES } from 'star-kitten-lib/eve';
import { format } from 'date-fns';
import { CharacterHelper } from 'star-kitten-lib/db';
import { getSkill } from '../../../../../star-kitten-lib/src/eve/models/skill';

export function characterPage(key: string = PageKey.CHARACTER): Page<CharacterContext> {
  return {
    key,
    content: async (context: CharacterContext) => {
      const character = context.character;
      const publicData = await CharacterAPI.getCharacterPublicData(character.eveID);
      const corporation = await CorporationAPI.getCorporationData(publicData.corporation_id);
      const alliance = publicData.alliance_id ? await AllianceAPI.getAllianceData(publicData.alliance_id) : null;
      const validToken = CharacterHelper.hasValidToken(character);

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
          { name: 'Corporation', value: corporation.name, inline: true },
          {
            name: 'Alliance',
            value: alliance ? alliance.name : 'N/A',
            inline: true,
          },
          {
            name: 'Security Status',
            value: publicData.security_status.toFixed(2) + '',
            inline: true,
          },
          {
            name: 'Birthday',
            value: format(new Date(publicData.birthday), 'd MMM yyy'),
            inline: false,
          },
        );

      if (validToken && CharacterHelper.hasScope(character, SCOPES.SKILLS_READ_SKILLQUEUE)) {
        const queue = await esi.getCharacterSkillQueue(character);
        const current = queue?.find((skill) => skill.queue_position === 0);
        if (current && current.start_date) {
          const skill = getSkill(current.skill_id);
          const percentage = calculateTrainingPercentage(current) * 100;
          embed.addFields(
            {
              name: 'Currently Training',
              value: `${getType(skill.type_id).name.en} ${current.finished_level} ${WHITE_SPACE} ${renderPercent(percentage)}`,
              inline: false,
            },
          );
        } else {
          embed.addFields({
            name: 'No Skills Training',
            value: WHITE_SPACE,
            inline: false,
          });
        }
      }

      if (!context.public) {

        if (validToken && CharacterHelper.hasScope(character, SCOPES.WALLET_READ_CHARACTER_WALLET)) {
          const formatter = new Intl.NumberFormat('en-US');
          const balance = await esi.CharacterAPI.getCharacterWallet(character);
          if (balance) {
            embed.addFields({ name: 'Wallet Balance', value: formatter.format(balance) + ' ISK', inline: false });
          }
        }

        if (validToken && CharacterHelper.hasAllScopes(character, [SCOPES.LOCATION_READ_LOCATION, SCOPES.LOCATION_READ_ONLINE, SCOPES.LOCATION_READ_SHIP_TYPE])) {
          const location = await esi.CharacterAPI.getCharacterLocation(character);
          const ship = await esi.CharacterAPI.getCharacterCurrentShip(character);
          if (location && ship) {
            embed.addFields({
              name: 'Location',
              value: `${getSolarSystem(location.solar_system_id).solarSystemName}`,
              inline: true,
            }, {
              name: 'Ship',
              value: `${getType(ship.ship_type_id).name.en} (${ship.ship_name})`,
              inline: true,
            });
          }

        }

        embed.setFooter({
          text: `${context.characterIndex + 1}/${context.user.characterIDs.length} -- id: ${character.eveID}${context.user.mainCharacterID === character.id ? ' -- Main' : ''}`,
          iconURL: CharacterAPI.getPortraitURL(character.eveID),
        });
      }


      if (!validToken) {
        embed.setColor('Red').setDescription(coloredText('This character has an invalid token. Please reauthenticate.', 'red'));
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
              disabled: context.characterIndex === context.user.characterIDs.length - 1,
            },

            validToken && { customId: PageKey.EDIT, label: 'Edit', style: ButtonStyle.Secondary },
            validToken && { label: 'Add', style: ButtonStyle.Link, url: `${global.App.config.baseUrl}/api/auth/discordID/${context.discordID}` },

            // invalid token, so show reauth and logout
            !validToken && { label: 'Reauthenticate', style: ButtonStyle.Link, url: `${global.App.config.baseUrl}/api/auth/discordID/${context.discordID}/characterID/${character.eveID}/scopes/${CharacterHelper.getScopes(character).join(' ')}` },
            !validToken && { customId: PageKey.CONFIRM_DELETE, label: 'remove', style: ButtonStyle.Danger }
          ),
        ],
        ephemeral: true,
      };
    },
  };
}

function renderPercent(percent: number) {
  const value = percent / 10;
  let str = '';
  for (let i = 1; i <= 10; ++i) {
    str += i <= value ? '◼' : i - 1 <= value ? '◩' : '▢';
    // shapes to test with:
    // '■' '▰' '▱' '▨' '▧' '◼' '▦' '▩' '▥' '▤' '▣' '▢' ⬜⬛◧□◻▬▭ '◪' '◫' '◩' '◨' '◧' '░' '▒' '▓'
  }
  return str + `${WHITE_SPACE}${percent.toFixed(1)}%`;
}
