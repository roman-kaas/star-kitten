import { jwtDecode } from 'jwt-decode';

export function characterIdFromToken(token: string) {
  const payload = jwtDecode(token);
  return parseInt(payload.sub.split(':')[2]);
}
