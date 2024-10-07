import { Column, OneToMany, Table, OneToOne } from '$lib/zORM';
import { DATABASE_KEY } from '../config';
import type { Character } from './character.model';

@Table({
  DATABASE: DATABASE_KEY,
  uniqueIndices: [(user: User) => user.discordID],
})
export class User {
  @Column({ unique: true, primary: true })
  id: number;

  @Column({ unique: true, name: 'discord_id' })
  discordID: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Character', (character: Character) => character.user)
  characters: Character[];

  @OneToOne('Character', (character: Character) => character.id, {
    name: 'main_character',
    nullable: true,
  })
  mainCharacter: Character;

  public User() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public static create(discordID: string) {
    const user = new User();
    user.discordID = discordID;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    return user;
  }
}
