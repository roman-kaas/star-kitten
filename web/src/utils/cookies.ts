
export function getCookies(headers: Headers) {
  if (!headers) return {};
  const cookieHeader = headers.get("Cookie");
  const cookies: Record<string, string> = {};

  if (cookieHeader === null) return {};

  for (const kv of cookieHeader.split(";")) {
    const [cookieKey, ...cookieVal] = kv.split("=");
    const key = cookieKey.trim();
    cookies[key] = cookieVal.join("=");
  }

  return cookies;
}

export function setCookie(response: Response, key: string, value: string, maxAge?: number) {
  response.headers.append('Set-Cookie', `${key}=${value}${maxAge ? '; Path=/; Max-Age=' + maxAge : ''}`);
}

export function removeCookie(response: Response, key: string) {
  response.headers.append('Set-Cookie', `${key}=""; Path=/; Max-Age=-1;`);
}