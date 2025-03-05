import type { RequestContext } from 'brisa';
import type { EVEAuth } from '@middleware';
import { getCookies, removeCookie, setCookie } from '@utils';
import { CharacterAPI, characterIdFromToken } from 'star-kitten-lib/eve';
import { CharacterHelper, UserHelper } from 'star-kitten-lib/db';

// GET /api/auth/callback
export async function GET(request: RequestContext) {
  const eveauth: EVEAuth = request.store.get('eveauth');
  const response = new Response('', { status: 302 });

  try {
    const cookies = getCookies(request.headers);
    const cookieDiscordID = cookies['discordID'];
    if (!cookieDiscordID) {
      throw new Error(`Missing discordID cookie in /api/auth/callback`);
    }

    const cookieCharacterID = cookies['characterID'];
    const token = await eveauth.validate(response);
    const characterID = characterIdFromToken(token.access_token);
    if (cookieCharacterID && parseInt(cookieCharacterID) !== characterID) {
      throw new Error(`Character ID mismatch: ${cookieCharacterID} !== ${characterID}`);
    }

    let user = UserHelper.findByDiscordId(cookieDiscordID);
    let character = CharacterHelper.findByUserAndEveID(user.id, Number(characterID));

    if (!user) {
      user = UserHelper.create(cookieDiscordID);
    }

    if (!user) {
      throw new Error(`Something went wrong with creating a user for id: ${cookieDiscordID}`);
    }

    if (!character) {
      const data = await CharacterAPI.getCharacterPublicData(characterID);
      if (!data) {
        throw new Error(`Failed to retreive character public data for id: ${characterID} - unable to create character`);
      }
      character = CharacterHelper.create(characterID, data.name || 'UNKNOWN NAME', user, token);

      // refetch from db to get id
      user = UserHelper.findByDiscordId(cookieDiscordID);
      character = CharacterHelper.findByUserAndEveID(user.id, Number(characterID));
      if (!character) {
        throw new Error(`Failed to retreive character from db for id: ${characterID}`);
      }

      if (!user.mainCharacterID) {
        user.mainCharacterID = character.id;
        UserHelper.save(user);
      }
    } else {
      character.accessToken = token.access_token;
      character.expiresAt = new Date(Date.now() + token.expires_in * 1000);
      character.refreshToken = token.refresh_token;
      CharacterHelper.save(character);
    }

    setCookie(response, 'currentUser', user.id + '', 60 * 60 * 24 * 30 /* 30 days */);
    response.headers.set('location', '/auth/success');
  } catch (err) {
    console.error(`Error: Callback failed with ${err}`);
    response.headers.set('location', '/auth/error');
    return response;

  } finally {
    removeCookie(response, 'discordID');
    removeCookie(response, 'characterID');
    removeCookie(response, 'state');
  }

  return response;
}
