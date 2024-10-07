import type {
  ColumnMetaData,
  ManyToOneMetaData,
  OneToManyMetaData,
  HasMetaData,
  HasColumnMetaData,
  HasManyToOneMetaData,
  HasOneToManyMetaData,
  HasTableMetaData,
  HasIndexMetaData,
  HasUniqueIndexMetaData,
  HasCompositeIndexMetaData,
  RegistryOptions,
  CompositeIndices,
  Indices,
  TableRegistry,
  UniqueIndices,
  OneToOneMetaData,
  HasOneToOneMetaData,
} from './types';
import { designTypeToSqliteType } from './utils';
import { Glob } from 'bun';

export class Registry {
  constructor() {
  }

  private metaDatas: HasMetaData[] = [];
  private classes: { [className: string]: new () => any } = {};
  private tables: { [key: string]: TableRegistry } = {};

  /**
   * Clear the registry
   */
  public clear() {
    this.metaDatas = [];
    this.classes = {};
    this.tables = {};
  }

  /**
   * Get the metadata, primarily exposed for testing
   */
  get metadata() {
    return this.metaDatas;
  }

  get classConstructors() {
    return this.classes;
  }

  public register(constructor: new () => any);
  public register(metadata: HasMetaData);
  public register(arg: any) {
    if (typeof arg === 'function') {
      this.classes[arg.name.toLowerCase()] = arg;
    } else {
      this.metaDatas.push(arg);
    }
  }

  public async buildTableRegistry(options: Partial<RegistryOptions> = {}) {
    if (options.modelPath && options.modelPattern) {
      try {
        // import all models to ensure they are registered
        const glob = new Glob(options.modelPattern);
        for await (const file of glob.scan({
          cwd: options.modelPath,
          absolute: true,
        })) {
          await import(file);
        }
      } catch (error) {
        console.warn(
          `Error importing models: ${error}. This may be expected if there are no models, or if the models are not in the expected location`,
        );
      }
    }

    // First, build tables so they are available for columns and relations
    for (const metadata of this.metaDatas) {
      if (metadata.type === 'table') {
        this.buildTable(metadata as HasTableMetaData);
      }
    }

    // Then build columns, so they are available for relations
    for (const metadata of this.metaDatas) {
      if (metadata.type === 'column') {
        this.buildColumn(metadata as HasColumnMetaData);
      }
    }

    // Build ManyToOne relations, so they are available for OneToMany relations
    for (const metadata of this.metaDatas) {
      if (metadata.type === 'many-to-one') {
        this.buildManyToOne(metadata as HasManyToOneMetaData);
      }
    }

    // Then build relations & indexes
    for (const metadata of this.metaDatas) {
      switch (metadata.type) {
        case 'one-to-one':
          this.buildOneToOne(metadata as HasOneToOneMetaData);
          break;
        case 'one-to-many':
          this.buildOneToMany(metadata as HasOneToManyMetaData);
          break;
        case 'index':
          this.buildIndex(metadata as HasIndexMetaData);
          break;
        case 'unique-index':
          this.buildUniqueIndex(metadata as HasUniqueIndexMetaData);
          break;
        case 'composite-index':
          this.buildCompositeIndex(metadata as HasCompositeIndexMetaData);
          break;
      }
    }
  }

  private buildTable(metadata: HasTableMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    tr.dbTable = metadata.options?.name || metadata.classname.toLowerCase();
    tr.className = metadata.classname;
    tr.dbColumns = {};
    tr.indices = [];
  }

  private buildColumn(metadata: HasColumnMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    const target = this.classes[metadata.classname.toLowerCase()];
    const designType = Reflect.getMetadata('design:type', new target(), metadata.key);

    const column: ColumnMetaData = {
      type: 'column',
      classname: metadata.classname,
      classKey: metadata.key,
      dbTableName: tr.dbTable!,
      dbKey: metadata.options?.name || metadata.key,
      isPrimary: metadata.options?.primary || false,
      isUnique: metadata.options?.unique || false,
      isNullable: metadata.options?.nullable || false,
      designType: designType.name,
      dbType: metadata.options?.type || designTypeToSqliteType(designType),
    };

    tr.dbColumns[metadata.key] = column;
  }

  private buildOneToMany(metadata: HasOneToManyMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    const referenceTable = this.getTableRegistry(metadata.options.referencedClassname);
    const referenceColumn = referenceTable.dbColumns[metadata.options.referencedKey];
    const target = this.classes[metadata.classname.toLowerCase()];
    const designType = Reflect.getMetadata('design:type', new target(), metadata.key);

    const otm: OneToManyMetaData = {
      type: 'one-to-many',
      classname: metadata.classname,
      classKey: metadata.key,
      dbTableName: tr.dbTable!, // name of the table for the foreign key
      dbKey: referenceColumn?.dbKey, // name of the foreign key
      dbType: designTypeToSqliteType(referenceColumn.designType), // type for the foreign key
      designType: designType.name, // design:type of the key in class
      relationClassname: metadata.options.referencedClassname,
      relationKey: metadata.options.referencedKey,
      relationDesignType: referenceColumn.designType, // design:type of the foreign key
    };

    tr.computedKeys[metadata.key] = otm;
  }

  private buildManyToOne(metadata: HasManyToOneMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    const referenceTable = this.getTableRegistry(metadata.options.referencedClassname);
    const referenceColumn = referenceTable.dbColumns[metadata.options.referencedKey];
    const target = this.classes[metadata.classname.toLowerCase()];
    const designType = Reflect.getMetadata('design:type', new target(), metadata.key);

    const col = structuredClone(tr.dbColumns[metadata.key]) as ColumnMetaData;

    // Define the column in this table for the foreign key
    const mto: ManyToOneMetaData = {
      ...col,
      type: 'many-to-one',
      classname: metadata.classname,
      classKey: metadata.key,
      dbTableName: tr.dbTable!, // name of the table for the foreign key
      dbKey: col?.dbKey, // name of the foreign key
      dbType: referenceColumn.dbType, // type for the foreign key
      designType: designType.name, // design:type of the foreign key
      relationClassname: metadata.options.referencedClassname,
      relationKey: metadata.options.referencedKey,
      relationDesignType: referenceColumn.designType,
      cascade: metadata.options.cascade,
    };

    tr.dbColumns[metadata.key] = mto;
    // tr.computedKeys[metadata.key] = mto;
  }

  private buildOneToOne(hasdata: HasOneToOneMetaData) {
    const tr = this.getTableRegistry(hasdata.classname);
    const referenceTable = this.getTableRegistry(hasdata.options.referencedClassname);
    const referenceColumn = referenceTable.dbColumns[hasdata.options.referencedKey];
    const target = this.classes[hasdata.classname.toLowerCase()];
    const designType = Reflect.getMetadata('design:type', new target(), hasdata.key);

    const col = structuredClone(tr.dbColumns[hasdata.key]) as ColumnMetaData;

    // Define the column in this table for the foreign key
    const data: OneToOneMetaData = {
      ...col,
      type: 'one-to-one',
      classname: hasdata.classname,
      classKey: hasdata.key,
      dbTableName: tr.dbTable!,
      dbKey: col?.dbKey || hasdata.options.name || hasdata.key,
      dbType: referenceColumn.dbType,
      isPrimary: hasdata.options?.primary || false,
      isUnique: hasdata.options?.unique || false,
      isNullable: hasdata.options?.nullable || false,
      designType: designType.name,
      relationClassname: hasdata.options.referencedClassname,
      relationKey: hasdata.options.referencedKey,
      relationDesignType: referenceColumn.designType,
    };

    tr.dbColumns[hasdata.key] = data;
    // tr.computedKeys[metadata.key] = data;
  }

  private buildIndex(metadata: HasIndexMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    const index: Indices = {
      type: 'index',
      keys: metadata.options.keys,
    };
    tr.indices.push(index);
  }

  private buildUniqueIndex(metadata: HasUniqueIndexMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    const uniqueIndex: UniqueIndices = {
      type: 'unique-index',
      keys: metadata.options.keys,
    };
    tr.indices.push(uniqueIndex);
  }

  private buildCompositeIndex(metadata: HasCompositeIndexMetaData) {
    const tr = this.getTableRegistry(metadata.classname);
    const compositeIndex: CompositeIndices = {
      type: 'composite-index',
      keys: metadata.options.keys,
    };
    tr.indices.push(compositeIndex);
  }

  getTableRegistry(name: string): TableRegistry {
    const lower = name.toLowerCase();
    if (!this.tables[lower]) {
      this.tables[lower] = {
        className: lower,
        dbTable: '',
        dbColumns: {},
        computedKeys: {},
        indices: [],
      };
    }
    return this.tables[lower];
  }

  getClass(name: string) {
    let lower = name.toLowerCase();
    if (!this.classes[lower]) return null;
    return new this.classes[lower]();
  }
}
