export type PropertyGetter<T> = (obj: T) => any;
export type MultiPropertyGetter<T> = (obj: T) => any[];

export type SQliteTypes = 'TEXT' | 'INTEGER' | 'DECIMAL' | 'BLOB' | 'NULL';

export enum DataType {
  STRING = 'TEXT',
  INTEGER = 'INTEGER',
  DECIMAL = 'DECIMAL',
  REAL = 'FLOAT',
  BLOB = 'BLOB',
  NULL = 'NULL',
}

export type ColumnMetaDataType = 'column' | 'one-to-many' | 'one-to-one';
export type VirtualColumnMetaDataType = 'join-one' | 'join-many' | 'many-to-one';
export type IndexType = 'index' | 'unique-index' | 'composite-index';
export type MetaDataType = 'table' | ColumnMetaDataType | IndexType | VirtualColumnMetaDataType;

export interface HasMetaData {
  key: string;
  classname: string;
  type: MetaDataType;
  options?:
    | ColumnDecoratorOptions
    | RelationMetaDataOptions
    | TableDecoratorOptions
    | (ManyToOneDecoratorOptions & RelationMetaDataOptions)
    | IndexMetaDataOptions
    | CompositeIndexMetaDataOptions
    | MultiRelationMetaDataOptions;
}

export interface HasColumnMetaData extends HasMetaData {
  type: 'column';
  options: ColumnDecoratorOptions;
}

export interface HasOneToManyMetaData extends HasMetaData {
  type: 'one-to-many';
  options: RelationMetaDataOptions;
}

export interface HasManyToOneMetaData extends HasMetaData {
  type: 'many-to-one';
  options: ManyToOneDecoratorOptions & RelationMetaDataOptions;
}

export interface HasOneToOneMetaData extends HasMetaData {
  type: 'one-to-one';
  options: RelationMetaDataOptions & ColumnDecoratorOptions;
}

export interface HasTableMetaData extends HasMetaData {
  type: 'table';
  options: TableDecoratorOptions;
}

export interface HasIndexMetaData extends HasMetaData {
  type: 'index';
  options: IndexMetaDataOptions;
}

export interface HasUniqueIndexMetaData extends HasMetaData {
  type: 'unique-index';
  options: IndexMetaDataOptions;
}

export interface HasCompositeIndexMetaData extends HasMetaData {
  type: 'composite-index';
  options: CompositeIndexMetaDataOptions;
}

export interface JoinOneMetaData extends HasMetaData {
  type: 'join-one';
  options: MultiRelationMetaDataOptions;
}

export interface JoinManyMetaData extends HasMetaData {
  type: 'join-many';
  options: MultiRelationMetaDataOptions;
}

export interface TableDecoratorOptions {
  name?: string;
  DATABASE?: string;
  indices?: PropertyGetter<any>[];
  uniqueIndices?: PropertyGetter<any>[];
  compositeIndices?: MultiPropertyGetter<any>[];
}

export interface ColumnDecoratorOptions {
  name?: string; // name of the column in the database
  type?: DataType; // type of the column in the database
  primary?: boolean; // if the column is a primary key
  unique?: boolean; // if the column is unique
  nullable?: boolean; // if the column is nullable
}

export interface RelationMetaDataOptions {
  referencedClassname: string;
  referencedKey: string;
}

export interface MultiRelationMetaDataOptions {
  referencedClassname: string;
  referencedKeys: string[][];
}

export interface ManyToOneDecoratorOptions {
  cascade?: boolean;
}

export interface IndexMetaDataOptions {
  keys: string[];
}

export interface CompositeIndexMetaDataOptions {
  keys: string[][];
}

export interface BaseColumnMetaData {
  type: ColumnMetaDataType | VirtualColumnMetaDataType;
  classname: string; // name of the class this column belongs to
  classKey: string; // key in the class
  designType: string; // design:type of the key in class
  dbTableName: string; // name of the table in the database
  dbKey: string; // key in the database
  dbType: string; // type in the database
  isPrimary?: boolean;
  isUnique?: boolean;
  isNullable?: boolean;
}

export interface BaseRelationMetaData extends BaseColumnMetaData {
  relationClassname: string; // name of the class that is related
  relationKey: string; // key in the class that is related
  relationDesignType: string; // design:type of the key in the related class
}

export interface ColumnMetaData extends BaseColumnMetaData {
  type: 'column';
}

export interface OneToOneMetaData extends BaseRelationMetaData {
  type: 'one-to-one';
}

export interface OneToManyMetaData extends BaseRelationMetaData {
  type: 'one-to-many';
}

export interface ManyToOneMetaData extends BaseRelationMetaData {
  type: 'many-to-one';
  cascade: boolean; // if the relation should cascade
}

export interface JoinOneMetaData extends BaseRelationMetaData {
  type: 'join-one';
  relationKeys: string[][] | string[];
}

export interface JoinManyMetaData extends BaseRelationMetaData {
  type: 'join-many';
  relationKeys: string[][] | string[];
}

export interface RegistryOptions {
  modelPattern?: string; // glob pattern to find models, default is '**/*.model.{js,ts}'
  modelPath?: string; // absolute path to find models, default is join(process.cwd(), 'src')
}

export interface DBOptions extends RegistryOptions {
  database: string;
  enableWal?: boolean;
  enableForeignKeys?: boolean;
}

export interface TableRegistry {
  className: string;
  dbTable: string;
  dbColumns: {
    [key: string]: ColumnMetaData | ManyToOneMetaData | OneToOneMetaData;
  };
  computedKeys: {
    [key: string]: OneToManyMetaData | ManyToOneMetaData | OneToOneMetaData | JoinOneMetaData;
  };
  indices: IIndices[];
}

export interface IIndices {
  type: 'index' | 'unique-index' | 'composite-index';
  keys: string[] | string[][];
}

export interface Indices extends IIndices {
  type: 'index';
  keys: string[];
}

export interface UniqueIndices extends IIndices {
  type: 'unique-index';
  keys: string[];
}

export interface CompositeIndices extends IIndices {
  type: 'composite-index';
  keys: string[][];
}
