import type { EVEAuth } from '@middleware';
import { setCookie } from '@utils';
import type { RequestContext } from 'brisa';

// GET /api/auth/discordID/:discordID/characterID/:characterID/scopes/:scopes
export async function GET({ store, route: { params }}: RequestContext) {
  // this is used to set the scopes that were sent, so just pass them along to auth directly 
  // with the provided scopes
  const eveauth: EVEAuth =  store.get('eveauth');
  const response = await eveauth.redirect(params!['scopes'] as string);
  setCookie(response, 'discordID', params!['discordID'] as string, 60 * 10 /* 10 min */);
  setCookie(response, 'discordID', params!['characterID'] as string, 60 * 10 /* 10 min */);
  return response;
}