import type { EVEAuth } from '@middleware';
import { setCookie } from '@utils';
import type { RequestContext } from 'brisa';
import { User } from 'star-kitten-lib/db';

// GET /api/auth/discordID/:discordID/addScopes/characterID/:characterID/scopes/:scopes
export async function GET({ store, route: { params }}: RequestContext) {
  const eveauth: EVEAuth =  store.get('eveauth');

  const discordID = params!['discordID'] as string;
  const characterID = params!['characterID'] as string;
  const requiredScopes = (params!['scopes'] as string).split(',');

  const user = User.findByDiscordId(discordID);
  const character = user.characters.find((c) => c.eveID === Number(characterID));
  if (!character) {
    throw new Error(`Character ${characterID} not found`);
  }

  const currentScopes = character.scopes;
  const set = new Set(currentScopes);
  requiredScopes.forEach((scope) => set.add(scope));
  const scopes = Array.from(set).join(' ');
  
  // As this is adding scopes, we need to redirect the user to the auth page
  const response = await eveauth.redirect(scopes);
  setCookie(response, 'discordID', discordID, 60 * 10 /* 10 min */);
  setCookie(response, 'characterID', characterID, 60 * 10 /* 10 min */);
  return response;
}