import { generateState } from 'oslo/oauth2';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

export interface EveAuthOptions {
  scopes?: string; // default scopes
  client_id: string;
  client_secret: string;
  callback_url: string;
  user_agent?: string;
}

export interface EveTokens {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

export async function createAuthorizationURL(options: EveAuthOptions) {
  const state = generateState();
  const url = new URL('https://login.eveonline.com/v2/oauth/authorize/');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', options.callback_url);
  url.searchParams.set('client_id', options.client_id);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', options.scopes ? options.scopes : 'publicData');
  return {
    url,
    state,
  };
}

export async function validateAuthorizationCode(code: string, options: EveAuthOptions): Promise<EveTokens> {
  try {
    console.log(`validating code: ${code}`);
    console.log(`with auth options: ${options.client_id} ${options.client_secret}`);
    const response = await fetch('https://login.eveonline.com/v2/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${options.client_id}:${options.client_secret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
      }),
    });
    return (await response.json()) as EveTokens;
  } catch (error) {
    console.error(`failed to validate EVE authorization code`, error);
    throw `${error}`;
  }
}

// cache the public key for EVE Online's OAuth2 provider
let eveAuthPublicKey: any;
export async function validateToken(token: string) {
  if (!eveAuthPublicKey) {
    try {
      const eveJWKS = await (await fetch('https://login.eveonline.com/oauth/jwks')).json() as { keys: any[] };
      eveAuthPublicKey = jwkToPem(eveJWKS.keys[0]);
    } catch (err) {
      console.error(`failed to get EVE Auth public keys`, err);
    }
  }

  try {
    const decoded = jwt.verify(token, eveAuthPublicKey);
    return decoded;
  } catch (err) {
    console.error(`failed to validate EVE token`, err);
    return null;
  }
}

export async function refresh(
  { refresh_token }: { refresh_token: string },
  options: EveAuthOptions,
): Promise<EveTokens> {
  const params = {
    grant_type: 'refresh_token',
    refresh_token,
  };

  if (options.scopes) {
    params['scope'] = options.scopes;
  }

  const response = await fetch('https://login.eveonline.com/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${options.client_id}:${options.client_secret}`).toString('base64')}`,
    },
    body: new URLSearchParams(params),
  });
  return (await response.json()) as EveTokens;
}

