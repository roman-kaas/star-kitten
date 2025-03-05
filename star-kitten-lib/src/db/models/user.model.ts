import { CharacterHelper } from './character.model';
import { db } from '..';
import { characters, users } from '../schema';
import { eq, sql } from 'drizzle-orm';

export interface User {
  id: number;
  discordID: string;
  createdAt: Date;
  updatedAt: Date;
  characterIDs: number[];
  mainCharacterID?: number;
}

export class UserHelper {
  public static find(id: number) {
    const result = db.select({
      id: users.id,
      discordID: users.discordID,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      mainCharacterID: users.mainCharacter,
      characterIDsString: sql<string>`json_group_array(characters.id)`,
    }).from(users)
      .where(eq(users.id, id))
      .leftJoin(characters, eq(users.id, characters.userID))
      .get();
    return this.createFromQuery(result) as User;
  }

  public static findByDiscordId(id: string) {
    const result = db.select({
      id: users.id,
      discordID: users.discordID,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      mainCharacterID: users.mainCharacter,
      characterIDsString: sql<string>`json_group_array(characters.id)`,
    }).from(users)
      .where(eq(users.discordID, id))
      .leftJoin(characters, eq(users.id, characters.userID))
      .get();
    return this.createFromQuery(result) as User;
  }

  public static findAll() {
    const result = db.select({
      id: users.id,
      discordID: users.discordID,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      mainCharacterID: users.mainCharacter,
      characterIDsString: sql<string>`json_group_array(characters.id)`,
    }).from(users)
      .leftJoin(characters, eq(users.id, characters.userID))
      .all();
    return this.createFromQuery(result) as User[];
  }

  public static findByCharacterId(id: number) {
    const result = db.select({
      id: users.id,
      discordID: users.discordID,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      mainCharacterID: users.mainCharacter,
      characterIDsString: sql<string>`json_group_array(characters.id)`,
    }).from(users)
      .leftJoin(characters, eq(users.id, characters.userID))
      .where(eq(characters.id, id))
      .all();
    return this.createFromQuery(result) as User;
  }

  public static findByCharacterName(name: string) {
    const result = db.select({
      id: users.id,
      discordID: users.discordID,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      mainCharacterID: users.mainCharacter,
      characterIDsString: sql<string>`json_group_array(characters.id)`,
    }).from(users)
      .leftJoin(characters, eq(users.id, characters.userID))
      .where(eq(characters.name, name))
      .all();
    return this.createFromQuery(result) as User;
  }

  public static createFromQuery(query: any): User | User[] {
    if (!query) return [];
    if (Array.isArray(query)) {
      return query.map((user: any) => {
        return {
          id: user.id,
          discordID: user.discordID,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          characterIDs: user.characterIDsString ? (JSON.parse(user.characterIDsString as any ?? '[]') as any[]).map(s => Number(s)).sort() : [],
          mainCharacterID: user.mainCharacterID,
        };
      });
    } else {
      return {
        id: query.id,
        discordID: query.discordID,
        createdAt: new Date(query.createdAt),
        updatedAt: new Date(query.updatedAt),
        characterIDs: query.characterIDsString ? (JSON.parse(query.characterIDsString as any ?? '[]') as any[]).map(s => Number(s)).sort() : [],
        mainCharacterID: query.mainCharacterID,
      };
    }
  }

  public static create(discordID: string): User {
    this.save({
      discordID: discordID,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);
    return this.findByDiscordId(discordID);
  }

  public static save(user: User) {
    db.insert(users)
      .values({
        id: user.id,
        discordID: user.discordID,
        mainCharacter: user.mainCharacterID,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          discordID: user.discordID,
          mainCharacter: user.mainCharacterID,
          updatedAt: user.updatedAt.getTime(),
        },
      }).run();
    return user;
  }

  public static delete(user: User) {
    db.delete(users)
      .where(eq(users.id, user.id))
      .run();
  }

  public static getCharacter(user: User, index: number) {
    if (!user.characterIDs) return undefined;
    if (index >= user.characterIDs.length) return undefined;
    return CharacterHelper.find(user.characterIDs[index]);
  }
}