import { refresh, validateToken } from '$eve/esi/auth';
import * as db from './authDB';


export async function refreshTokenAndUpdateCharacter(id: number, scopes?: string) {
  const character = await db.getCharacter(id);
  if (!character) {
    console.error(`Character not found for id ${id}`);
    return;
  }

  const tokens = await refresh({ refresh_token: character.refreshToken }, { ...global.App.config.eve, scopes });
  const decoded = await validateToken(tokens.access_token);
  if (!decoded) {
    console.error(`Failed to validate token for character ${id}`);
    return;
  }

  character.accessToken = tokens.access_token;
  character.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  character.refreshToken = tokens.refresh_token;
  db.save(character);
  return tokens;
}
