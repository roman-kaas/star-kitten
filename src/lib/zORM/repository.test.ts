import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test';
import { DB } from './db';
import { Repository } from './repository';
import Database from 'bun:sqlite';
import { DataType, type DBOptions, type TableRegistry } from './types';
import { Table, Column, OneToMany, ManyToOne } from './decorators';

@Table({
  compositeIndices: [(u: User) => [u.first, u.last]],
})
class User {
  @Column({ type: DataType.INTEGER, primary: true, unique: true })
  id: number;

  @Column()
  first: string;

  @Column()
  last: string;

  @OneToMany('Photo', (photo: Photo) => photo.user)
  photos: Photo[];
}

@Table({
  indices: [(p: Photo) => p.user],
})
class Photo {
  @Column({ type: DataType.INTEGER, primary: true })
  id: number;

  @Column({ name: 'user_id' })
  @ManyToOne('User', (u: User) => u.id)
  user: User;
}

class RegistryMock {
  private tableRegistry: { [name: string]: TableRegistry } = {
    user: {
      className: 'User',
      dbTable: 'user',
      dbColumns: {
        id: {
          dbKey: 'id',
          dbType: 'INTEGER',
          isPrimary: true,
          isUnique: true,
          isNullable: false,
          type: 'column',
          classKey: 'id',
          classname: 'User',
          dbTableName: 'user',
          designType: 'number',
        },
        first: {
          dbKey: 'first',
          dbType: 'TEXT',
          isPrimary: false,
          isUnique: false,
          isNullable: false,
          type: 'column',
          classKey: 'first',
          classname: 'User',
          dbTableName: 'user',
          designType: 'string',
        },
        last: {
          dbKey: 'last',
          dbType: 'TEXT',
          isPrimary: false,
          isUnique: false,
          isNullable: false,
          type: 'column',
          classKey: 'last',
          classname: 'User',
          dbTableName: 'user',
          designType: 'string',
        },
      },
      computedKeys: {
        photos: {
          type: 'one-to-many',
          relationClassname: 'Photo',
          relationKey: 'user',
          dbKey: 'id',
          dbType: 'INTEGER',
          isPrimary: false,
          isUnique: false,
          isNullable: false,
          classKey: 'photos',
          classname: 'User',
          dbTableName: 'user',
          designType: 'Photo[]',
          relationDesignType: 'number',
        },
      },
      indices: [
        {
          type: 'composite-index',
          keys: ['first', 'last'],
        },
      ],
    },
    photo: {
      className: 'Photo',
      dbTable: 'photo',
      dbColumns: {
        id: {
          dbKey: 'id',
          dbType: 'INTEGER',
          isPrimary: true,
          isUnique: true,
          isNullable: false,
          type: 'column',
          classKey: 'id',
          classname: 'Photo',
          dbTableName: 'photo',
          designType: 'number',
        },
        user: {
          dbKey: 'user_id',
          dbType: 'INTEGER',
          isPrimary: false,
          isUnique: false,
          isNullable: false,
          type: 'many-to-one',
          classKey: 'user',
          classname: 'Photo',
          dbTableName: 'photo',
          designType: 'User',
          cascade: true,
          relationClassname: 'User',
          relationKey: 'id',
          relationDesignType: 'number',
        },
      },
      computedKeys: {},
      indices: [
        {
          type: 'index',
          keys: ['user_id'],
        },
      ],
    },
  };

  private classes: { [className: string]: new () => any } = {
    user: User,
    photo: Photo,
  };

  constructor() {}

  getTableRegistry(tableClassName: string) {
    return this.tableRegistry[tableClassName.toLowerCase()];
  }

  getClass(className: string) {
    return this.classes[className.toLowerCase()];
  }
}

class DBMock {
  private static instances?: { [key: string]: DBMock } = {};

  private db: Database;
  private options: DBOptions;
  private repositories: { [key: string]: Repository<any> } = {};
  private readonly _registry: RegistryMock = new RegistryMock();

  private constructor(
    private key: string,
    options?: DBOptions,
  ) {
    this.options = options || {
      database: ':memory:',
      enableWal: true,
      enableForeignKeys: true,
      modelPath: './src/models',
      modelPattern: '**/*.model.{js,ts}',
    };
  }

  public static getDB(key: string = 'default', options?: DBOptions): DBMock {
    if (!DBMock.instances[key]) {
      DBMock.instances[key] = new DBMock(key, options);
    }
    return DBMock.instances[key];
  }

  public async initialize() {
    if (this.db) return;
    console.debug(`initializing dbmock at ${this.options?.database}`);
    this.db = new Database(this.options?.database || '');

    if (this.options?.enableWal) {
      this.db.exec('PRAGMA journal_mode = WAL');
    }

    if (this.options?.enableForeignKeys) {
      this.db.exec('PRAGMA foreign_keys = ON');
    }

    // await this._registry.buildTableRegistry();

    return this;
  }

  public close() {
    this.db?.close();
    this.db = undefined;
    DBMock.instances[this.key] = undefined;
  }

  public getRepository(name: string): Repository<any>;
  public getRepository<T>(model: { new (): T }): Repository<T>;
  public getRepository(model: { new (): any } | string): Repository<any> {
    const name = (typeof model === 'string' ? model : model.name).toLowerCase();
    if (this.repositories[name]) {
      return this.repositories[name];
    }

    if (typeof model === 'string') {
      const repo = this.repositories[name];
      if (!repo) {
        const tr = this.registry.getTableRegistry(name);
        const entity = this.registry.getClass(tr.className || '');
        if (!entity) {
          throw new Error(`getRepository: Entity ${name} not found`);
        }
        this.repositories[name] = new Repository(entity.name, this as any);
      }
    } else {
      if (!model) {
        throw new Error('getRepository: Model not found');
      }

      if (!this.repositories[name]) {
        this.repositories[name] = new Repository(model.name, this as any);
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

mock.module('./db.ts', () => {
  return { DB: DBMock };
});

describe('Repository', () => {
  let db: DB;

  beforeEach(async () => {
    db = await DB.getDB().initialize({ database: ':memory:' });
  });

  afterEach(() => {
    db.close();
  });

  it('should initialize the repository and create the table', () => {
    const repo = db.getRepository('User');
    const tableExists = db.sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get('user');
    expect(tableExists).toBeTruthy();
  });

  it('should save an entity', () => {
    const entity = new User();
    entity.id = 1;
    entity.first = 'Test';
    entity.last = 'User';

    db.getRepository(User.name).save(entity);

    const savedEntity = db.sqlite.prepare(`SELECT * FROM user WHERE id = ?`).get(1) as User;
    expect(savedEntity).toBeTruthy();
    expect(savedEntity.first).toBe('Test');
  });

  it('should find an entity by id', () => {
    const entity = new User();
    entity.id = 1;
    entity.first = 'Test';
    entity.last = 'User';

    const repository = db.getRepository(User.name);
    repository.save(entity);

    const foundEntity = repository.findOne(1) as User;
    expect(foundEntity).toBeTruthy();
    expect(foundEntity.first).toBe('Test');
  });

  it('should find entities by query fields', () => {
    const entity1 = new User();
    entity1.id = 1;
    entity1.first = 'Test 1';
    entity1.last = 'User 1';

    const entity2 = new User();
    entity2.id = 2;
    entity2.first = 'Test 2';
    entity2.last = 'User 2';

    const repository = db.getRepository(User.name);

    repository.save(entity1);
    repository.save(entity2);

    const foundEntities = repository.find({ first: 'Test 1' });
    expect(foundEntities.length).toBe(1);
    expect(foundEntities[0].last).toBe('User 1');
  });

  it('should find all entities', () => {
    const entity1 = new User();
    entity1.id = 1;
    entity1.first = 'Test 1';
    entity1.last = 'User 1';

    const entity2 = new User();
    entity2.id = 2;
    entity2.first = 'Test 2';
    entity2.last = 'User 2';

    const repository = db.getRepository(User.name);

    repository.save(entity1);
    repository.save(entity2);

    const allEntities = repository.findAll();
    expect(allEntities.length).toBe(2);
  });

  it('should delete an entity by id', () => {
    const entity = new User();
    entity.id = 1;
    entity.first = 'Test';
    entity.last = 'User';

    const repository = db.getRepository(User.name);

    repository.save(entity);
    repository.delete(1);

    const deletedEntity = db.sqlite.prepare(`SELECT * FROM user WHERE id = ?`).get(1);
    expect(deletedEntity).toBeFalsy();
  });
});
