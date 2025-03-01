# zORM
An ORM for Bun Sqlite designed for rapid application development. 

Warning: Migrations are not supported yet so model changes will require a reset of the database.

## Usage

The DB class will be your applications entry point to interact with sqlite data. DB supports multiple sqlite databases through unique keys. If no key is provided to `DB.getDB(key: string)`, the key: 'default' is used.

```typescript
// src/userdb.ts
import { DB } from 'zORM';

export const DB_KEY = 'userdb';

export async initializeDB() {
  await DB.getDB(DB_KEY).initialize({
  database: join(process.cwd(), 'db/userdb.db'), // path on disk to the sqlite db file
  modelPath: join(process.cwd(), 'src/models/'), // Root directory to scan for models
  modelPattern: '**/*.models.ts', // Glob pattern used to select which files are models
  enableWal: true,
  enableForeignKeys: true,
  });
}

// src/models/user.model.ts
import { Column, OneToMany, Table, OneToOne } from 'zORM';
import { DB_KEY } from '../../userdb.ts';
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
  mainCharacter?: Character;

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

// src/app.ts
import { DB } from 'zORM';
import { DB_KEY, initializeDB } from './userdb';
import { User } from './models/user.model.ts';


const USER_ID = 1;
const DISCORD_ID = '1234567890';

// get & update a user
const userRepository = DB.getDB(DB_KEY).getRepository(User);
const user = userRepository.findOne(USER_ID);
user.discordId = '123456789';
userRepository.save(user);

// delete a user
userRepository.delete(USER_ID);

// find one or more users by Discord ID
// Note: find only works for equality comparisons for now.
const users = userRepository.find({ discordId: DISCORD_ID });



```

## Models

Models are defined using decorated classes. The following Decorators are used for Model decoration.

### @Table
The Table decorator is required on all model classes. This defines the DB Key and any index that should be created on the table.

zORM supports singular, unique, and composite indexes.

```typescript
@Table({
  // required
  DATABASE: DB_KEY, // Key for the database to register this model under

  // optional
  name: 'User', // if the name of the table should not match the class name
  indices: [],
  uniqueIndices: [(user: User) => user.discordID],
  compositeIndices: [(user: User) => [user.first, user.last]]
});
export class User { ... }
```

#### options
* name?: string; -- name that should be used for the table in the sqlite database
* DATABASE?: string; -- KEY used to identify the DB, defaults to 'default' if not set
* indices?: PropertyGetter<any>[]; -- singular indices
* uniqueIndices?: PropertyGetter<any>[]; -- unique indices
* compositeIndices?: MultiPropertyGetter<any>[]; -- composite indices

### @Column
The most common decorator for a model, @Column defines a sqlite column.

```typescript
export class User {
  @Column({ unique: true, primary: true })
  id: number;

  @Column({ unique: true, name: 'discord_id' })
  discordID: string;
}
```

#### options
* name?: string; -- name of the column in the database
* type?: DataType; -- type of the column in the database
* primary?: boolean; -- if the column is a primary key
* unique?: boolean; -- if the column is unique
* nullable?: boolean; -- if the column is nullable

### @OneToMany & @ManyToOne
The OneToMany and ManyToOne decorators will define a relationship between a column on one table to multiple rows of another table. eg. a User has multiple Characters

A OneToMany must reference a model that maintains a ManyToOne decorator. A OneToMany will not add a column to any table, but is purely a relationship that will join the data at runtime to pull in data from the related table when fetching this object.

A ManyToOne may also be used alongside a Column decorator to provide options for the column if you prefer that method, or options can be provided directly on the ManyToOne decorator.

```typescript
export class User {
  @OneToMany('Character', (character: Character) => character.user)
  characters: Character[];
}

export class Character {
  @Column({ name: 'user_id' })
  @ManyToOne('User', (user: User) => user.id)
  user: User;
}
```

### @OneToOne
The OneToOne identifies a singular relationship between rows across tables. The OneToOne will define a column in sqlite.

A OneToOne does not need to exist in both related classes if one of the classes does not want to pull in the related object at runtime or the column is not desired in both tables.

```typescript
export class User {
  @OneToOne('Character', (character: Character) => character.id, 
  {
    name: 'main_character',
    nullable: true,
  })
  mainCharacter?: Character;
}
```