import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { Character } from './character.model';
import { db } from '@db';
import { characters, users } from '@db/schema';
import { aliasedTable, eq } from 'drizzle-orm';

export const main = aliasedTable(characters, 'main');

export class User {
  id!: number;
  discordID!: string;
  createdAt!: Date;
  updatedAt!: Date;
  characters!: Character[];
  mainCharacter?: Character;

  private construtor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public static find(id: number) {
    const result = db.select().from(users)
        .where(eq(users.id, id))
        .leftJoin(characters, eq(users.id, characters.userID))
        .leftJoin(main, eq(users.mainCharacter, characters.id))
        .get();
    return this.createFromQuery(result) as User;
  }

  public static findByDiscordId(id: string) {
    const result = db.select().from(users)
        .where(eq(users.discordID, id))
        .leftJoin(characters, eq(users.id, characters.userID))
        .leftJoin(main, eq(users.mainCharacter, characters.id))
        .get();
    return this.createFromQuery(result) as User;
  }

  public static findAll() {
    const result = db.select().from(users)
        .leftJoin(characters, eq(users.id, characters.userID))
        .leftJoin(main, eq(users.mainCharacter, characters.id))
        .all();
    return this.createFromQuery(result) as User[];
  }

  public static findByCharacterId(id: number) {
    const result = db.select().from(users)
        .leftJoin(characters, eq(users.id, characters.userID))
        .leftJoin(main, eq(users.mainCharacter, characters.id))
        .where(eq(characters.id, id))
        .get();
    return this.createFromQuery(result) as User;
  }
  
  public static findByCharacterName(name: string) {
    const result = db.select().from(users)
        .leftJoin(characters, eq(users.id, characters.userID))
        .leftJoin(main, eq(users.mainCharacter, characters.id))
        .where(eq(characters.name, name))
        .get();
    return this.createFromQuery(result) as User;
  }

  public static create(discordID: string) {
    const user = new User();
    user.discordID = discordID;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  }

  public static createFromQuery(query: any): User | User[] {
    if (!query) return [];
    if (!query.users) return [];
    if (Array.isArray(query.users)) {
      return query.users.map((user: any) => {
        const u = new User();
        u.id = user.id;
        u.discordID = user.discordID;
        u.createdAt = new Date(user.createdAt);
        u.updatedAt = new Date(user.updatedAt);
        u.characters = Character.createCharacters(query, u);
        u.mainCharacter = Character.createFromMain(query, u);
        return u;
      });
    } else {
      const user = new User();
      user.id = query.users.id;
      user.discordID = query.users.discordID;
      user.createdAt = new Date(query.users.createdAt);
      user.updatedAt = new Date(query.users.updatedAt);
      user.characters = Character.createCharacters(query, user);
      user.mainCharacter = Character.createFromMain(query, user);
      return user;
    }
  }

  public save() {
    db.insert(users)
      .values({
        id: this.id,
        discordID: this.discordID,
        mainCharacter: this.mainCharacter?.id,
        createdAt: this.createdAt.getTime(),
        updatedAt: this.updatedAt.getTime(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          discordID: this.discordID,
          mainCharacter: this.mainCharacter?.id,
          updatedAt: this.updatedAt.getTime(),
        },
      }).run();
    this.characters.forEach((character) => {
      character.save();
    });
    return this;
  }

  public delete() {
    db.delete(users)
      .where(eq(users.id, this.id))
      .run();
    this.characters.forEach((character) => {
      character.delete();
    });
  }
}

