import { setCookie } from '@utils';
import type { RequestContext } from 'brisa';
import { User } from 'star-kitten-lib/db'

// GET /api/auth/discordID/:discordID/removeScopes/characterID/:characterID/scopes/:scopes
export function GET({ route: { params }}: RequestContext) {
  const discordID = params!['discordID'] as string;
  const characterID = params!['characterID'] as string;
  const removeScopes = (params!['scopes'] as string).split(',');

  const user = User.findByDiscordId(discordID);
  const character = user.characters.find((c) => c.eveID === Number(characterID));
  if (!character) {
    throw new Error(`Character ${characterID} not found`);
  }
  const currentScopes = character.scopes;
  const set = new Set(currentScopes);
  removeScopes.forEach((scope) => set.delete(scope));
  
  // As this is removing scopes, we can do this without user interaction
  character.refreshTokens(Array.from(set).join(' '));
  
  // redirect to success page
  const response = new Response('', { status: 302 });
  response.headers.set('location', '/auth/success');
  setCookie(response, 'discordID', params!['discordID'] as string, 60 * 10 /* 10 min */);
  setCookie(response, 'discordID', characterID, 60 * 10 /* 10 min */);
  return response;
}