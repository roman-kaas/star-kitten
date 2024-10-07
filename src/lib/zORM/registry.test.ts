import { describe, it, beforeEach, expect } from 'bun:test';
import { DataType, type HasMetaData } from './types';
import { Column, Table, ManyToOne, OneToMany, OneToOne } from './decorators';
import { DB } from './db';
import type { Registry } from './registry';

describe('Registry', () => {
  let registry: Registry;
  beforeEach(() => {
    registry = DB.getDB().registry;
    registry.clear();
  });

  it('should register a class constructor', () => {
    class TestClass {}
    registry.register(TestClass);
    expect(registry.getClass(TestClass.name)).toBeInstanceOf(TestClass);
  });

  it('should register metadata', () => {
    const metadata: HasMetaData = {
      type: 'table',
      classname: 'TestClass',
      key: 'TestClass',
    };
    registry.register(metadata);
    expect(registry.metadata).toContain(metadata);
  });

  it('should build table registry', async () => {
    @Table({ name: 'test_class' })
    class TestClass {}

    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(TestClass.name);
    expect(tableRegistry.className).toBe(TestClass.name);
    expect(tableRegistry.dbTable).toBe('test_class');
  });

  it('should build column metadata', async () => {
    @Table({ name: 'test_class' })
    class TestClass {
      @Column({ type: DataType.INTEGER, primary: true })
      id: number;
    }
    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry('TestClass');
    expect(tableRegistry.dbColumns['id']).toBeDefined();
    expect(tableRegistry.dbColumns['id']).toMatchObject({
      type: 'column',
      classname: TestClass.name,
      classKey: 'id',
      dbTableName: 'test_class',
      dbKey: 'id',
      isPrimary: true,
      isUnique: false,
      isNullable: false,
      designType: Number.name,
      dbType: 'INTEGER',
    });
  });

  it('should build many-to-one metadata', async () => {
    @Table()
    class User {
      @Column({ type: DataType.INTEGER, primary: true })
      id: number;
    }

    @Table()
    class Photo {
      @ManyToOne('User', (u: User) => u.id)
      user: User;
    }

    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(Photo.name);
    expect(tableRegistry.dbColumns['user']).toBeDefined();
  });

  it('should build one-to-many metadata', async () => {
    @Table()
    class User {
      @Column({ type: DataType.INTEGER, primary: true })
      id: number;

      @OneToMany('Photo', (photo: Photo) => photo.user)
      photos: Photo[];
    }

    @Table()
    class Photo {
      @Column({ type: DataType.INTEGER, primary: true })
      id: number;

      @ManyToOne('User', (u: User) => u.id)
      user: User;
    }

    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(User.name);
    expect(tableRegistry.computedKeys['photos']).toBeDefined();
  });

  it('should build index metadata', async () => {
    @Table({
      indices: [(u: User) => u.id],
    })
    class User {
      @Column({ type: DataType.INTEGER, primary: true })
      id: number;
    }
    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(User.name);
    expect(tableRegistry.indices).toContainEqual({
      type: 'index',
      keys: ['id'],
    });
  });

  it('should build unique index metadata', async () => {
    @Table({
      uniqueIndices: [(u: User) => u.id],
    })
    class User {
      @Column({ type: DataType.INTEGER, primary: true })
      id: number;
    }
    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(User.name);
    expect(tableRegistry.indices).toContainEqual({
      type: 'unique-index',
      keys: ['id'],
    });
  });

  it('should build composite index metadata', async () => {
    @Table({
      compositeIndices: [(u: User) => [u.first, u.last]],
    })
    class User {
      @Column()
      first: string;

      @Column()
      last: string;
    }
    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(User.name);
    expect(tableRegistry.indices).toContainEqual({
      type: 'composite-index',
      keys: [['first', 'last']],
    });
  });

  it('should build one-to-one metadata', async () => {
    interface IUser {
      photo: IPhoto;
    }
    interface IPhoto {
      user: IUser;
    }
    @Table()
    class User {
      @Column()
      id: number;

      @OneToOne('Photo', (p: Photo) => p.user)
      photo: IPhoto;
    }

    @Table()
    class Photo {
      @ManyToOne('User', (u: User) => u.id)
      user: IUser;
    }

    await registry.buildTableRegistry();
    const tableRegistry = registry.getTableRegistry(User.name);
    expect(tableRegistry.dbColumns['photo']).toBeDefined();
  });
});
