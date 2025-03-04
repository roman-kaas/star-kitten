import { generateState } from 'oslo/oauth2';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';
import { jwtDecode } from 'jwt-decode';
import { options } from './options';

export interface EveTokens {
  access_token: string;
  expires_in: number;
  refresh_token: string;
}

export async function createAuthorizationURL(scopes: string[] | string = 'publicData') {
  const state = generateState();
  const url = new URL('https://login.eveonline.com/v2/oauth/authorize/');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('redirect_uri', options.callback_url);
  url.searchParams.set('client_id', options.client_id);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', Array.isArray(scopes) ? scopes.join(' ') : scopes);
  return {
    url,
    state,
  };
}

export async function validateAuthorizationCode(code: string): Promise<EveTokens> {
  try {
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
      const eveJWKS = (await (await fetch('https://login.eveonline.com/oauth/jwks')).json()) as { keys: any[] };
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
  scopes?: string[] | string,
): Promise<EveTokens> {
  const params = {
    grant_type: 'refresh_token',
    refresh_token,
  };

  if (scopes) {
    params['scope'] = Array.isArray(scopes) ? scopes.join(' ') : scopes;
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

export function characterIdFromToken(token: string) {
  const payload = jwtDecode(token);
  return parseInt(payload.sub!.split(':')[2]);
}
