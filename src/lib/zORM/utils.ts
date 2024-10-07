import type { MultiPropertyGetter, PropertyGetter } from './types';

export function getAccessedKeys<T>(fn: MultiPropertyGetter<T>): string[] {
  const accessedKeys = new Set<string>();
  const handler = {
    get(target, property) {
      accessedKeys.add(property.toString());
      return target[property];
    },
  };
  const proxy = new Proxy({}, handler);
  fn(proxy);
  return Array.from(accessedKeys);
}

export function getPropertyName<T>(getter: PropertyGetter<T>): string {
  const handler: ProxyHandler<any> = {
    get(target, property) {
      return property.toString();
    },
  };
  const proxy = new Proxy({}, handler);
  return getter(proxy);
}

export function convertToSql(value: any, type: string): any {
  switch (type) {
    case 'TEXT':
      return value.toString();
    case 'INTEGER':
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      if (value instanceof Date) {
        console.log(`Date: ${value}`);
        return value.getTime();
      }
      return parseInt(value);
    case 'DECIMAL':
      return parseFloat(value);
    case 'BLOB':
      return Buffer.from(value);
    case 'NULL':
      return null;
  }
}

export function convertFromSql(value: any, type: string): any {
  switch (type.toLowerCase()) {
    case 'string':
      return value.toString();
    case 'number':
      return parseInt(value);
    case 'boolean':
      return value === 1;
    case 'date':
      return new Date(value);
    case 'float':
      return parseFloat(value);
    case 'buffer':
      return Buffer.from(value);
    case 'uint8array':
      return new Uint8Array(value);
    case 'null':
      return null;
  }
}

export function designTypeToSqliteType(designType: any) {
  if (!designType) return 'NULL';
  const name = designType.name?.toLowerCase() || (typeof designType).toLowerCase();
  switch (name) {
    case 'string':
      return 'TEXT';
    case 'number':
      return 'INTEGER';
    case 'boolean':
      return 'INTEGER';
    case 'date':
      return 'INTEGER';
    case 'buffer':
      return 'BLOB';
    case 'uint8array':
      return 'BLOB';
  }
  return 'NULL';
}
