import { DB } from './db';
import type { OneToOneMetaData, ManyToOneMetaData, OneToManyMetaData, TableRegistry } from './types';
import { convertToSql, convertFromSql } from './utils';

export class Repository<T> {
  private tableClassName: string;
  private tableRegistry: TableRegistry;

  constructor(
    name: string,
    private db: DB,
  ) {
    this.tableClassName = name;
    this.tableRegistry = db.registry.getTableRegistry(name);
    this.init();
  }

  init = () => {
    const cols: string[] = []; // columns
    const fks: string[] = []; // foreign keys

    for (const key of Object.keys(this.tableRegistry.dbColumns)) {
      const colDef = this.tableRegistry.dbColumns[key];
      cols.push(
        `${colDef.dbKey} ${colDef.dbType}${colDef.isPrimary ? ' PRIMARY KEY' : ''}${colDef.isUnique ? ' UNIQUE' : ''}${colDef.isNullable ? ' NULL' : ' NOT NULL'}`,
      );

      if (colDef.type === 'many-to-one') {
        const manyToOne = colDef as ManyToOneMetaData;
        fks.push(
          `FOREIGN KEY (${manyToOne.dbKey}) REFERENCES ${manyToOne.relationClassname}(${manyToOne.relationKey})${manyToOne.cascade ? ' ON DELETE CASCADE' : ''}`,
        );
        continue;
      }
    }

    const query = `CREATE TABLE IF NOT EXISTS ${this.tableRegistry.dbTable} (${cols.join(', ')}${fks.length ? ', ' + fks.join(', ') : ''})`;
    this.db.sqlite.exec(query);
  };

  public save = (entity: T) => {
    const columnNames: string[] = [];
    const columnValues = [];

    for (const key of Object.keys(this.tableRegistry.dbColumns)) {
      const colDef = this.tableRegistry.dbColumns[key];

      if (colDef.type === 'many-to-one') {
        const meta = colDef as ManyToOneMetaData;
        columnNames.push(colDef.dbKey);
        columnValues.push(convertToSql(entity[key][meta.relationKey], colDef.dbType));
        continue;
      }

      if (colDef.type === 'one-to-one') {
        const meta = colDef as OneToOneMetaData;
        if (entity[key]) {
          columnNames.push(colDef.dbKey);
          columnValues.push(convertToSql(entity[key][meta.relationKey], colDef.dbType));
        }
        continue;
      }
      columnNames.push(colDef.dbKey);
      columnValues.push(convertToSql(entity[key], colDef.dbType));
    }

    const query = `INSERT OR REPLACE INTO ${this.tableRegistry.dbTable} (${columnNames.join(',')}) VALUES (${columnNames.map(() => '?').join(',')})`;
    const stmt = this.db.sqlite.prepare(query);
    stmt.run(columnValues as any);
  };

  public find = (queryFields: any, limit?: number, offset?: number, parent: any = null): T[] => {
    const query = Object.keys(queryFields)
      .map((key) => {
        return `${this.tableRegistry.dbColumns[key].dbKey} = ?`;
      })
      .join(' AND ');

    const params = Object.values(queryFields);
    const queryString = `SELECT * FROM ${this.tableRegistry.dbTable} WHERE ${query}${limit ? ` LIMIT ${limit}` : ''}${offset ? ` OFFSET ${offset}` : ''}`;
    const stmt = this.db.sqlite.prepare(queryString);
    const rows = stmt.all(params as any);
    return rows.map((row: T) => this.hydrate(row, parent)) as T[];
  };

  public findOne = (id: any, parent: any = null) => {
    const query = `SELECT * FROM ${this.tableRegistry.dbTable} WHERE id = ?`;
    const stmt = this.db.sqlite.prepare(query);
    return this.hydrate(stmt.get(id) as any, parent);
  };

  public findAll = (limit?: number, offset?: number, parent: any = null) => {
    const query = `SELECT * FROM ${this.tableRegistry.dbTable}${limit ? ` LIMIT ${limit}` : ''}${offset ? ` OFFSET ${offset}` : ''}`;
    const stmt = this.db.sqlite.prepare(query);
    const rows = stmt.all();
    return rows.map((row: T) => this.hydrate(row, parent));
  };

  public delete = (id: any, parent: any = null) => {
    const query = `DELETE FROM ${this.tableRegistry.dbTable} WHERE id = ?`;
    console.debug(`${query} ${id}`);
    const stmt = this.db.sqlite.prepare(query);
    stmt.run(id);
  };

  private hydrate = (row: T, parent: any = null) => {
    if (!row) return null;
    const entity = this.db.registry.getClass(this.tableClassName);
    for (const key of Object.keys(this.tableRegistry.dbColumns)) {
      const colDef = this.tableRegistry.dbColumns[key];
      if (colDef.type === 'many-to-one') {
        const meta = colDef as ManyToOneMetaData;
        if (parent && parent[meta.relationKey] === row[meta.dbKey]) {
          entity[key] = parent;
          continue;
        }
        entity[key] = this.db.getRepository(meta.relationClassname).findOne(row[meta.dbKey], entity) as any;
        continue;
      }

      if (colDef.type === 'one-to-one') {
        const meta = colDef as OneToOneMetaData;
        entity[key] = this.db
          .getRepository(meta.relationClassname)
          .find({ [meta.relationKey]: row[colDef.dbKey] }, undefined, undefined, entity)?.[0] as any;
        continue;
      }

      entity[colDef.classKey] = convertFromSql(row[colDef.dbKey], colDef.designType);
    }

    for (const key of Object.keys(this.tableRegistry.computedKeys)) {
      const colDef = this.tableRegistry.computedKeys[key];

      if (colDef.type === 'one-to-many') {
        const oneToMany = colDef as OneToManyMetaData;
        const relationRegistry = this.db.registry.getTableRegistry(oneToMany.relationClassname);
        const relCol = relationRegistry.dbColumns[oneToMany.relationKey] as ManyToOneMetaData;
        entity[key] = this.db
          .getRepository(oneToMany.relationClassname)
          .find({ [oneToMany.relationKey]: row[relCol.relationKey] }, undefined, undefined, entity) as any;
        continue;
      }
    }
    return entity;
  };
}
