import type { RequestContext } from 'brisa';
import {
  createAuthorizationURL as eveAuthURL,
  validateAuthorizationCode,
  validateToken,
  type EveTokens,
} from 'star-kitten-lib/eve';
import { getCookies, removeCookie, setCookie } from '@utils/cookies';
import { OAuth2RequestError } from 'oslo/oauth2';
import { options } from 'star-kitten-lib/eve';

export type EVEAuth = {
  validateToken: typeof validateToken;
  validateAuthorizationCode: (code: string) => Promise<EveTokens>;
  validate: (response: Response) => Promise<EveTokens>;
  redirect: (scopes?: string) => Promise<Response>;
}

export default async function middleware(req: RequestContext) {

  req.store.set('options', options);

  const redirect = async (scopes?: string): Promise<Response> => {
    const { url, state } = await eveAuthURL(scopes);
    const response = new Response('', { status: 302 });
    setCookie(response, 'state', state, 60 * 10 /* 10 min */);
    response.headers.set('location', url.href);
    return response;
  }

  const eveauth: EVEAuth = {
    validateAuthorizationCode: (code: string) => {
      try {
        return validateAuthorizationCode(code);
      } catch (error) {
        throw new OAuth2RequestError(req, {
          error: `Failed to authenticate with EVE Online ${error}`,
        });
      }
    },
    validateToken,

    validate: async (response: Response) => {
      const query = new URL(req.url).searchParams;
      const code = query.get('code');
      if (!code) {
        throw Error(`code missing from query parameters, there may be an error with the OAuth provider`);
      }

      const cookies = getCookies(req.headers);

      if (cookies['state'] !== query.get('state')) throw Error('invalid state');
      removeCookie(response, 'state');

      try {
        const tokens = await validateAuthorizationCode(code);
        const decoded = await validateToken(tokens.access_token);
        if (!decoded) throw 'Invalid Token';
        return tokens;
      } catch (error) {
        throw new OAuth2RequestError(req, {
          error: `Failed to authenticate with EVE Online ${error}`,
        });
      }
    },

    redirect,
  }

  req.store.set('eveauth', eveauth);

  // -----------------------------------------

  // Route Authorization

}