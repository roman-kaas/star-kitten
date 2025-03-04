import { describe, it, expect, beforeEach } from 'bun:test';
import { Table, Column, ManyToOne, OneToMany, OneToOne } from './decorators';
import { Registry } from './registry';
import { DataType } from './types';
import { DB } from './db';

describe('Decorators', () => {
  let registry: Registry = DB.getDB().registry;

  beforeEach(() => {
    registry.clear();
  });

  it('should register a table', async () => {
    @Table({ name: 'users' })
    class User {}
    await registry.buildTableRegistry();
    expect(registry.metadata).toHaveLength(1);
    expect(registry.metadata[0]).toMatchObject({
      key: 'User',
      classname: 'User',
      type: 'table',
      options: { name: 'users' },
    });
  });

  it('should register a class for the table', async () => {
    @Table({ name: 'users' })
    class User {}
    await registry.buildTableRegistry();
    expect(Object.keys(registry.classConstructors)).toHaveLength(1);
    expect(registry.classConstructors[User.name.toLowerCase()]).toBe(User);
  });

  it('should register a column', async () => {
    @Table()
    class User {
      @Column({ type: DataType.STRING })
      name: string;
    }

    await registry.buildTableRegistry();
    const user = new User();
    const metadata = registry.metadata.find((m) => m.type === 'column');
    expect(metadata).toMatchObject({
      key: 'name',
      classname: 'User',
      type: 'column',
      options: { type: DataType.STRING },
    });
  });

  it('should register a many-to-one relationship', async () => {
    @Table()
    class User {
      @Column()
      id: number;
    }

    @Table()
    class Photo {
      @ManyToOne('User', (u: User) => u.id)
      user: User;
    }
    await registry.buildTableRegistry();

    const mtoMetadata = registry.metadata.find((m) => m.type === 'many-to-one');
    expect(mtoMetadata).toMatchObject({
      key: 'user',
      classname: 'Photo',
      type: 'many-to-one',
      options: {
        referencedClassname: 'User',
        referencedKey: 'id',
      },
    });
  });

  it('should register a one-to-many relationship', async () => {
    interface IUser {
      photos: IPhoto;
    }

    interface IPhoto {
      user: IUser;
    }

    @Table()
    class User implements IUser {
      @Column()
      id: number;

      @OneToMany('Photo', (p: Photo) => p.user)
      photos: IPhoto;
    }

    @Table()
    class Photo implements IPhoto {
      @ManyToOne('User', (u: User) => u.id)
      user: IUser;
    }
    await registry.buildTableRegistry();

    const otmMetadata = registry.metadata.find((m) => m.type === 'one-to-many');
    expect(otmMetadata).toMatchObject({
      key: 'photos',
      classname: 'User',
      type: 'one-to-many',
      options: {
        referencedClassname: 'Photo',
        referencedKey: 'user',
      },
    });
  });

  it('should register an index', async () => {
    @Table({
      indices: [(u: User) => u.name],
    })
    class User {
      name: string;
    }
    await registry.buildTableRegistry();

    const metadata = registry.metadata.find((m) => m.type === 'index');
    expect(metadata).toMatchObject({
      key: 'User',
      classname: 'User',
      type: 'index',
      options: { keys: ['name'] },
    });
  });

  it('should register a unique index', async () => {
    @Table({
      uniqueIndices: [(u: User) => u.email],
    })
    class User {
      email: string;
    }
    await registry.buildTableRegistry();

    const metadata = registry.metadata.find((m) => m.type === 'unique-index');
    expect(metadata).toMatchObject({
      key: 'User',
      classname: 'User',
      type: 'unique-index',
      options: { keys: ['email'] },
    });
  });

  it('should register a composite index', async () => {
    @Table({
      compositeIndices: [(u: User) => [u.firstName, u.lastName]],
    })
    class User {
      firstName: string;
      lastName: string;
    }
    await registry.buildTableRegistry();

    const metadata = registry.metadata.find((m) => m.type === 'composite-index');
    expect(metadata).toMatchObject({
      key: 'User',
      classname: 'User',
      type: 'composite-index',
      options: { keys: [['firstName', 'lastName']] },
    });
  });

  it('should register a on-to-one relationship', async () => {
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

    const hoMetadata = registry.metadata.find((m) => m.type === 'one-to-one');
    expect(hoMetadata).toMatchObject({
      key: 'photo',
      classname: 'User',
      type: 'one-to-one',
      options: {
        referencedClassname: 'Photo',
        referencedKey: 'user',
      },
    });
  });
});
