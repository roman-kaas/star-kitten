import type { EVEAuth } from '@middleware';
import { setCookie } from '@utils';
import type { RequestContext } from 'brisa';

// GET /api/auth/discordID/:discordID
export async function GET({ store, route: { params }}: RequestContext) {
  // called when adding a new character, so just redirect to auth and set cookies
  const eveauth: EVEAuth =  store.get('eveauth');
  const response = await eveauth.redirect('publicData');
  setCookie(response, 'discordID', params!['discordID'] as string, 60 * 10 /* 10 min */);
  return response;
}