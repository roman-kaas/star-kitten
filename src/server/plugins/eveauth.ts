import { Elysia, t } from 'elysia';
import { OAuth2RequestError } from 'oslo/oauth2';
import {
  createAuthorizationURL as eveAuthURL,
  validateAuthorizationCode,
  validateToken,
  refresh,
  type EveAuthOptions,
} from '$eve/esi/auth';

export default (options: EveAuthOptions) => {
  return new Elysia()
    .error('OAUTH2_REQUEST_ERROR', OAuth2RequestError)
    .derive(({ request, cookie, query, redirect }) => {
      const createAuthorizationURL = async (scopes?: string) => {
        const { url, state } = await eveAuthURL({ ...options, scopes });
        cookie.state.value = state;
        cookie.state.maxAge = 60 * 10; // 10 min
        console.log(`url: ${url}`);
        return url;
      };

      return {
        eveauth: {
          createAuthorizationURL,

          validateAuthorizationCode: (code: string) => {
            try {
              return validateAuthorizationCode(code, options);
            } catch (error) {
              throw new OAuth2RequestError(request, {
                error: `Failed to authenticate with EVE Online ${error}`,
              });
            }
          },

          validateToken,

          validate: async () => {
            if (!query.code) {
              throw Error(`code missing from query parameters, there may be an error with the OAuth provider`);
            }

            if (cookie.state.value !== query.state) throw Error('invalid state');
            cookie.state.remove();

            try {
              const tokens = await validateAuthorizationCode(query.code, options);
              console.log(`tokens: ${tokens}`);
              const decoded = await validateToken(tokens.access_token);
              if (!decoded) throw 'Invalid Token';
              return tokens;
            } catch (error) {
              throw new OAuth2RequestError(request, {
                error: `Failed to authenticate with EVE Online ${error}`,
              });
            }
          },

          redirect: async (scopes?: string) => redirect((await createAuthorizationURL(scopes)).href),

          refresh: async () => {
            if (!cookie.refresh_token.value) throw Error('No refresh token found');
            try {
              const tokens = await refresh({ refresh_token: cookie.refresh_token.value }, options);
              return tokens;
            } catch (error) {
              throw new OAuth2RequestError(request, {
                error: `Failed to refresh token with EVE Online ${error}`,
              });
            }
          },
        },
      };
    })
    .as('plugin');
};
