import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DBOptions } from './types';
import { Database } from 'bun:sqlite';
import { Repository } from './repository';
import { Registry } from './registry';

export class DB {
  private static instances?: { [key: string]: DB } = {};

  private db: Database;
  private options: DBOptions;
  private repositories: { [key: string]: Repository<any> } = {};
  private readonly _registry: Registry;

  private constructor(private key: string) {
    this.options = {
      database: ':memory:',
      enableWal: true,
      enableForeignKeys: true,
      modelPath: './src/models',
      modelPattern: '**/*.model.{js,ts}',
    };
    this._registry = new Registry();
  }

  public static getDB(key: string = 'default'): DB {
    if (!DB.instances[key]) {
      DB.instances[key] = new DB(key);
    }
    return DB.instances[key];
  }

  public async initialize(options: Partial<DBOptions> = {}) {
    if (this.db) return;
    this.options = {
      database: ':memory:',
      enableWal: true,
      enableForeignKeys: true,
      ...options,
    };



    if (!existsSync(dirname(this.options.database))) {
      console.error('Database directory not found ' + dirname(this.options.database));
      console.error('Database directory not found ' + this.options.database);
      return;
    }

    console.log(`Initializing database at ${this.options.database}`);

    this.db = new Database(this.options?.database || '');

    if (this.options.enableWal) {
      this.db.exec('PRAGMA journal_mode = WAL');
    }

    if (this.options.enableForeignKeys) {
      this.db.exec('PRAGMA foreign_keys = ON');
    }

    await this.registry.buildTableRegistry(options);

    return this;
  }

  public close() {
    this.db?.close();
    this.registry.clear();
    DB.instances[this.key] = undefined;
  }

  public getRepository(name: string): Repository<any>;
  public getRepository<T>(model: { new(): T }): Repository<T>;
  public getRepository(model: { new(): any } | string): Repository<any> {
    const name = (typeof model === 'string' ? model : model.name).toLowerCase();
    if (this.repositories[name]) {
      return this.repositories[name];
    }

    if (typeof model === 'string') {
      const repo = this.repositories[name];
      if (!repo) {
        this.repositories[name] = new Repository(name, this);
      }
    } else {
      if (!model) {
        throw new Error('getRepository: Model not found');
      }

      if (!this.repositories[name]) {
        this.repositories[name] = new Repository(model.name, this);
      }
    }
    return this.repositories[name];
  }

  get sqlite() {
    return this.db;
  }

  get registry() {
    return this._registry;
  }
}
