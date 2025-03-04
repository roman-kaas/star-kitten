import type { RequestContext } from 'brisa';
import type { EVEAuth } from '@middleware';
import { getCookies, removeCookie, setCookie } from '@utils';
import { CharacterAPI, characterIdFromToken } from 'star-kitten-lib/eve';
import { Character, User } from 'star-kitten-lib/db';

// GET /api/auth/callback
export async function GET(request: RequestContext) {
  const eveauth: EVEAuth =  request.store.get('eveauth');
  const response = new Response('', { status: 302 });

  try {
    const cookies = getCookies(request.headers);
    console.log(cookies);
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


    let user = User.findByDiscordId(cookieDiscordID);
    let character = user.characters.find(c => c.eveID === characterID);

    if (!user) {
      user = User.create(cookieDiscordID);
      user.save();
    }

    if (!user) {
      throw new Error(`Something went wrong with creating a user for id: ${cookieDiscordID}`);
    }

    if (!character) {
      const data = await CharacterAPI.getCharacterPublicData(characterID);
      if (!data) {
        throw new Error(`Failed to retreive character public data for id: ${characterID} - unable to create character`);
      }
      character = Character.create(characterID, data.name || 'UNKNOWN NAME', user, token);
      character.save();

      // refetch from db to get id
      user = User.findByDiscordId(cookieDiscordID);
      character = user.characters.find(c => c.eveID === characterID);

      if (!user.mainCharacter) {
        user.mainCharacter = character;
        user.save();
      }
    } else {
      character.accessToken = token.access_token;
      character.expiresAt = new Date(Date.now() + token.expires_in * 1000);
      character.refreshToken = token.refresh_token;
      character.save();
    }

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
  
  // TEMP -- set current user
  setCookie(response, 'currentUser', User.find(1).id + '', 60 * 60 * 24 * 30 /* 30 days */);

  return response;
}
