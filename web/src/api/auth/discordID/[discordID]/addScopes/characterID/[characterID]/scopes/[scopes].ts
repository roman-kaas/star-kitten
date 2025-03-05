import type { EVEAuth } from '@middleware';
import { setCookie } from '@utils';
import type { RequestContext } from 'brisa';
import { CharacterHelper, UserHelper } from 'star-kitten-lib/db';

// GET /api/auth/discordID/:discordID/addScopes/characterID/:characterID/scopes/:scopes
export async function GET({ store, route: { params } }: RequestContext) {
  const eveauth: EVEAuth = store.get('eveauth');

  const discordID = params!['discordID'] as string;
  const characterID = params!['characterID'] as string;
  const requiredScopes = (params!['scopes'] as string).split(',');

  const user = UserHelper.findByDiscordId(discordID);
  const character = CharacterHelper.findByUserAndEveID(user.id, Number(characterID));
  if (!character) {
    throw new Error(`Character ${characterID} not found`);
  }

  const currentScopes = CharacterHelper.getScopes(character);
  const set = new Set(currentScopes);
  requiredScopes.forEach((scope) => set.add(scope));
  const scopes = Array.from(set).join(' ');

  // As this is adding scopes, we need to redirect the user to the auth page
  const response = await eveauth.redirect(scopes);
  setCookie(response, 'discordID', discordID, 60 * 10 /* 10 min */);
  setCookie(response, 'characterID', characterID, 60 * 10 /* 10 min */);
  return response;
}