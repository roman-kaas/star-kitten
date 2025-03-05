import { refresh, validateToken, type EveTokens } from 'star-kitten-lib/eve';
import type { User } from './user.model';
import { jwtDecode } from 'jwt-decode';
import { characters } from '../schema';
import { eq, and } from 'drizzle-orm';
import { db } from '..';

export interface Character {
  id: number;
  eveID: number;
  userID: number;
  accessToken: string;
  expiresAt: Date;
  refreshToken: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class CharacterHelper {

  public static hasValidToken(character: Character) {
    return new Date() < character.expiresAt;
  };

  public static getScopes(character: Character) {
    const decoded = jwtDecode(character.accessToken) as {
      scp: string[] | string;
    };
    return typeof decoded.scp === 'string' ? [decoded.scp] : decoded.scp;
  }

  public static hasOnlyPublicScope(character: Character) {
    return this.getScopes(character).length === 1 && this.hasScope(character, 'publicData');
  }

  public static getTokens(character: Character) {
    return {
      access_token: character.accessToken,
      refresh_token: character.refreshToken,
      expires_in: (character.expiresAt.getTime() - Date.now()) / 1000,
    };
  }

  public static hasScope(character: Character, scope: string) {
    return this.getScopes(character).includes(scope);
  }

  public static hasAllScopes(character: Character, scopes: string[]) {
    const has = this.getScopes(character);
    return scopes.every((scope) => has.includes(scope));
  }

  public static find(id: number) {
    const result = db.select().from(characters)
      .where(eq(characters.id, id))
      .limit(1)
      .get();
    const c = this.createCharacters(result)
    return c ? c[0] : undefined;
  }

  public static findByUser(user: User) {
    const result = db.select().from(characters)
      .where(eq(characters.userID, user.id))
      .all();
    return this.createCharacters(result);
  }

  public static findByUserAndEveID(userID: number, eveID: number) {
    const result = db.select().from(characters)
      .where(and(eq(characters.userID, userID), eq(characters.eveID, eveID)))
      .limit(1)
      .get();
    const c = this.createCharacters(result);
    return c ? c[0] : undefined;
  }

  public static findByName(userID: number, name: string) {
    const result = db.select().from(characters)
      .where(and(eq(characters.name, name), eq(characters.userID, userID)))
      .limit(1)
      .get();
    const c = this.createCharacters(result);
    return c ? c[0] : undefined;
  }

  public static findAll() {
    const result = db.select().from(characters)
      .all();
    return this.createCharacters(result);
  }

  static create(eveID: number, name: string, user: User, tokens: EveTokens) {
    return this.save({
      eveID: eveID,
      userID: user.id,
      accessToken: tokens.access_token,
      expiresAt: new Date(tokens.expires_in * 1000),
      refreshToken: tokens.refresh_token,
      name: name,
      createdAt: new Date(),
    } as Character);
  }

  static createCharacters(query: any): Character[] {
    if (!query) return [];
    if (Array.isArray(query)) {
      return query.map((character: any) => {
        return {
          id: character.id,
          eveID: character.eveID,
          userID: character.userID,
          accessToken: character.accessToken,
          expiresAt: new Date(character.expiresAt),
          refreshToken: character.refreshToken,
          name: character.name,
          createdAt: new Date(character.createdAt),
          updatedAt: new Date(character.updatedAt),
        };
      });
    } else {
      return [{
        id: query.id,
        eveID: query.eveID,
        userID: query.userID,
        accessToken: query.accessToken,
        expiresAt: new Date(query.expiresAt),
        refreshToken: query.refreshToken,
        name: query.name,
        createdAt: new Date(query.createdAt),
        updatedAt: new Date(query.updatedAt),
      }];
    }
  }

  public static save(character: Character) {
    db.insert(characters)
      .values({
        id: character.id,
        eveID: character.eveID,
        userID: character.userID,
        name: character.name,
        accessToken: character.accessToken,
        expiresAt: character.expiresAt.getTime(),
        refreshToken: character.refreshToken,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: characters.id,
        set: {
          eveID: character.eveID,
          userID: character.userID,
          name: character.name,
          accessToken: character.accessToken,
          expiresAt: character.expiresAt.getTime(),
          refreshToken: character.refreshToken,
          updatedAt: Date.now(),
        },
      })
      .run();
    return CharacterHelper.findByUserAndEveID(character.userID, character.eveID);
  }

  public static delete(character: Character) {
    db.delete(characters)
      .where(eq(characters.id, character.id))
      .run();
  }

  public static async refreshTokens(character: Character, scopes?: string[] | string) {
    const tokens = await refresh({ refresh_token: character.refreshToken }, scopes);
    const decoded = await validateToken(tokens.access_token);
    if (!decoded) {
      console.error(`Failed to validate token for character ${character.id}`);
      return character;
    }
    character.accessToken = tokens.access_token;
    character.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    character.refreshToken = tokens.refresh_token;
    this.save(character);
    return character;
  }
}
