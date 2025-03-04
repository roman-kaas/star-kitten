import { Character } from '@db/models';
import { options } from './options';
import { ESI_LATEST_URL } from './scopes';

const cache = new Map<string, CacheItem>();

interface RequestOptions extends RequestInit {
  noCache?: boolean;
  cacheDuration?: number; // default 30 minutes
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

setInterval(cleanCache, 1000 * 60 * 15); // clean cache every 15 minutes

const defaultCacheDuration = 1000 * 60 * 30; // 30 minutes

export async function esiFetch<T>(
  path: string,
  character?: Character,
  { method = 'GET', body, noCache = false, cacheDuration = defaultCacheDuration }: Partial<RequestOptions> = {},
) {
  try {
    const headers = {
      'User-Agent': options.user_agent,
      Accept: 'application/json',
    };

    if (character) {
      // check if the token is expired
      if (!character.validToken) {
        await character.refreshTokens();
        if (!character.validToken) {
          throw new Error(`Failed to refresh token for character: ${character.eveID}`);
        }
      }

      headers['Authorization'] = `Bearer ${character.accessToken}`;
    }

    const init: RequestInit = {
      headers,
      method: method || 'GET',
      body: body || undefined,
    };

    const url = new URL(`${ESI_LATEST_URL}${path.startsWith('/') ? path : '/' + path}`);
    url.searchParams.set('datasource', 'tranquility');

    if (!noCache && init.method === 'GET') {
      const cached = cache.get(url.href);
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
      cache.set(url.href, {
        expires: Math.max(res.headers.get('expires') && new Date(Number(res.headers.get('expires') || '')).getTime() || 0, Date.now() + cacheDuration),
        data,
      });
    }

    return data as T;
  } catch (err) {
    console.error(`ESI request failure at ${path} | ${JSON.stringify(err)}`, err);
    return null;
  }
}
