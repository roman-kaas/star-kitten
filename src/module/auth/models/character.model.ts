import type { EveTokens } from '$eve/esi/auth';
import { Column, ManyToOne, Table } from '$lib/zORM';
import type { User } from './user.model';
import { jwtDecode } from 'jwt-decode';
import { DATABASE_KEY } from '../config';

@Table({ DATABASE: DATABASE_KEY })
export class Character {
  @Column({ unique: true, primary: true })
  id: number;

  @Column({ name: 'user_id' })
  @ManyToOne('User', (user: User) => user.id)
  user: User;

  @Column({ name: 'access_token' })
  accessToken: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @Column()
  name: string;

  static create(id: number, name: string, user: User, tokens: EveTokens) {
    const character = new Character();
    character.id = id;
    character.user = user;
    character.accessToken = tokens.access_token;
    character.expiresAt = new Date(tokens.expires_in * 1000);
    character.refreshToken = tokens.refresh_token;
    character.name = name;
    return character;
  }

  get scopes() {
    const decoded = jwtDecode(this.accessToken) as {
      scp: string[] | string;
    };
    return typeof decoded.scp === 'string' ? [decoded.scp] : decoded.scp;
  }

  hasScope(scope: string) {
    return this.scopes.includes(scope);
  }

  hasAllScopes(scopes: string[]) {
    return scopes.every((scope) => this.hasScope(scope));
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
}
