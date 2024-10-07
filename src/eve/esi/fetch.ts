import { refreshTokenAndUpdateCharacter } from '$module/auth';
import type { EveTokens } from './auth';
import { ESI_LATEST_URL } from './scopes';
import { characterIdFromToken } from './utils';

const cache = new Map<string, CacheItem>();

interface RequestOptions extends RequestInit {
  noCache?: boolean;
  cacheDuration?: number; // default 15 minutes
}

interface CacheItem {
  expires: number;
  data: any;
}

function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache) {
    if (value.expires < now) {
      cache.delete(key);
    }
  }
}

setInterval(cleanCache, 1000 * 60 * 5); // clean cache every 5 minutes

const defaultCacheDuration = 1000 * 60 * 15; // 15 minutes

export async function esiFetch<T>(
  path: string,
  tokens?: EveTokens,
  {
    method = 'GET',
    body,
    noCache = false,
    cacheDuration = defaultCacheDuration,
  }: Partial<RequestOptions> = {}) {
  try {
    const headers = {
      'User-Agent': global.App.config.eve.user_agent,
      Accept: 'application/json',
    };

    if (tokens) {

      // check if the token is expired
      if (Date.now() > tokens.expires_in) {
        tokens = await refreshTokenAndUpdateCharacter(characterIdFromToken(tokens.access_token));
      }

      headers['Authorization'] = `Bearer ${tokens.access_token}`;
    }

    const init: RequestInit = {
      headers,
      method: method || 'GET',
      body: body || undefined,
    };

    const url = `${ESI_LATEST_URL}${path.startsWith('/') ? path : '/' + path}?datasource=tranquility`;

    if (!noCache && init.method === 'GET') {
      const cached = cache.get(url);
      if (cached && cached?.expires > Date.now()) {
        return cached.data as T;
      }
    }

    const res = await fetch(url, init);
    const data = await res.json();

    if (!res.ok) {
      console.error(`ESI request failure at ${path} | ${res.status}:${res.statusText} => ${JSON.stringify(data)}`);
      return null;
    }

    if (init.method === 'GET') {
      cache.set(url, {
        expires: res.headers.get('expires') ? new Date(res.headers.get('expires')).getTime() : Date.now() + cacheDuration,
        data,
      });
    }

    return data as T;
  } catch (err) {
    console.error(`ESI request failure at ${path} | ${JSON.stringify(err)}`, err);
    return null;
  }
}



