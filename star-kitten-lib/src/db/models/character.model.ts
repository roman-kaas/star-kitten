import { refresh, validateToken, type EveTokens } from 'star-kitten-lib/eve';
import type { User } from './user.model';
import { jwtDecode } from 'jwt-decode';
import { characters } from '@db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@db';

export class Character {
  id!: number;
  eveID!: number;
  user?: User;
  userID!: number;
  accessToken!: string;
  expiresAt!: Date;
  refreshToken!: string;
  name!: string;
  createdAt!: Date;
  updatedAt!: Date;

  get validToken() {
    return new Date() < this.expiresAt;
  };

  get scopes() {
    const decoded = jwtDecode(this.accessToken) as {
      scp: string[] | string;
    };
    return typeof decoded.scp === 'string' ? [decoded.scp] : decoded.scp;
  }
  get isOnlyPublicScope() {
    return this.scopes.length === 1 && this.hasScope('publicData');
  }

  get tokens() {
    return {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      expires_in: (this.expiresAt.getTime() - Date.now()) / 1000,
    };
  }

  hasScope(scope: string) {
    return this.scopes.includes(scope);
  }

  hasAllScopes(scopes: string[]) {
    return scopes.every((scope) => this.hasScope(scope));
  }

  private constructor() {}

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
        .get();
    return this.createCharacters(result);
  }
  
  public static findByName(name: string) {
    const result = db.select().from(characters)
        .where(eq(characters.name, name))
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
    const character = new Character();
    character.eveID = eveID;
    character.user = user;
    character.userID = user.id;
    character.accessToken = tokens.access_token;
    character.expiresAt = new Date(tokens.expires_in * 1000);
    character.refreshToken = tokens.refresh_token;
    character.name = name;
    character.createdAt = new Date();
    return character;
  }

  static createCharacters(query: any, forUser?: User): Character[] {
    if (!query.characters) return [];
      if (Array.isArray(query.characters)) {
        return query.characters.map((character: any) => {
          const c = new Character();
          c.id = character.id;
          c.eveID = character.eveID;
          c.user = forUser;
          c.userID = character.userID;
          c.accessToken = character.accessToken;
          c.expiresAt = new Date(character.expiresAt);
          c.refreshToken = character.refreshToken;
          c.name = character.name;
          c.createdAt = new Date(character.createdAt);
          c.updatedAt = new Date(character.updatedAt);
          return c;
        });
      } else {
        const character = new Character();
        character.id = query.characters.id;
        character.eveID = query.characters.eveID;
        character.user = forUser;
        character.userID = query.characters.userID;
        character.accessToken = query.characters.accessToken;
        character.expiresAt = new Date(query.characters.expiresAt);
        character.refreshToken = query.characters.refreshToken;
        character.name = query.characters.name;
        character.createdAt = new Date(query.characters.createdAt);
        character.updatedAt = new Date(query.characters.updatedAt);
        return [character];
      }
  }

  static createFromMain(query: any, forUser?: User) {
    if (!query.main) return undefined;
    const character = new Character();
    character.id = query.main.id;
    character.eveID = query.main.eveID;
    character.user = forUser;
    character.userID = query.main.userID;
    character.accessToken = query.main.accessToken;
    character.expiresAt = new Date(query.main.expiresAt);
    character.refreshToken = query.main.refreshToken;
    character.name = query.main.name;
    character.createdAt = new Date(query.main.createdAt);
    character.updatedAt = new Date(query.main.updatedAt);
    return character;
  }

  public save() {
    db.insert(characters)
      .values({
        id: this.id,
        eveID: this.eveID,
        userID: this.userID,
        name: this.name,
        accessToken: this.accessToken,
        expiresAt: this.expiresAt.getTime(),
        refreshToken: this.refreshToken,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .onConflictDoUpdate({
        target: characters.id,
        set: {
          eveID: this.eveID,
          userID: this.userID,
          name: this.name,
          accessToken: this.accessToken,
          expiresAt: this.expiresAt.getTime(),
          refreshToken: this.refreshToken,
          updatedAt: Date.now(),
        },
      })
      .run();
      return this;
  }

  public delete() {
    db.delete(characters)
      .where(eq(characters.id, this.id))
      .run();
  }
  
  public async refreshTokens(scopes?: string[] | string) {
    const tokens = await refresh({ refresh_token: this.refreshToken }, scopes);
    const decoded = await validateToken(tokens.access_token);
    if (!decoded) {
      console.error(`Failed to validate token for character ${this.id}`);
      return this;
    }
    this.accessToken = tokens.access_token;
    this.expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    this.refreshToken = tokens.refresh_token;
    this.save();
    return this;
  }
}
