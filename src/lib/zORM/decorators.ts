import 'reflect-metadata';
import type {
  TableDecoratorOptions,
  ColumnDecoratorOptions,
  PropertyGetter,
  ManyToOneDecoratorOptions,
  MultiPropertyGetter,
} from './types';
import { getPropertyName, getAccessedKeys } from './utils';
import { DB } from './db';

const PROPERTY_DECORATOR_METADATA_KEY = Symbol('propertyMetadata');

/**
 * Use on class to indicate that the class is a table in the database
 * @param {TableDecoratorOptions} Options
 */
export function Table(options?: TableDecoratorOptions) {
  return function (constructor: any) {
    const registry = DB.getDB(options?.DATABASE || 'default').registry;
    registry.register(constructor);

    registry.register({
      key: constructor.name,
      classname: constructor.name,
      type: 'table',
      options,
    });

    if (options?.indices) {
      registry.register({
        key: constructor.name,
        classname: constructor.name,
        type: 'index',
        options: { keys: options.indices.map(getPropertyName) },
      });
    }

    if (options?.uniqueIndices) {
      registry.register({
        key: constructor.name,
        classname: constructor.name,
        type: 'unique-index',
        options: { keys: options.uniqueIndices.map(getPropertyName) },
      });
    }

    if (options?.compositeIndices) {
      registry.register({
        key: constructor.name,
        classname: constructor.name,
        type: 'composite-index',
        options: { keys: options.compositeIndices.map(getAccessedKeys) },
      });
    }

    const propertyData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, constructor.prototype) || [];
    if (propertyData) {
      console.debug(`Registering properties for ${constructor.name} with ${propertyData.length} properties`);
      propertyData.forEach((options) => {
        registry.register(options);
      });
    }
  };
}

/**
 * Use on class properties to indicate that the property is a column in the database
 * @param {ColumnDecoratorOptions} Options
 */
export function Column(options?: ColumnDecoratorOptions) {
  return function (target: any, key: string) {
    const metadata = {
      key,
      classname: target.constructor.name,
      type: 'column',
      options,
    };

    const existingData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, target) || [];
    existingData.push(metadata);
    Reflect.defineMetadata(PROPERTY_DECORATOR_METADATA_KEY, existingData, target);
  };
}

// Relations ---------------------------------------------------

/**
 * Use on class properties to indicate that the has a many-to-one relationship
 * @param {string} referenceClass -- class name this relationship will reference
 * @param {PropertyGetter<T>} fn -- function to get the property to reference
 * @param {ColumnDecoratorOptions} Options
 */
export function ManyToOne<T>(referenceClass: string, fn: PropertyGetter<T>, options?: ManyToOneDecoratorOptions) {
  return (target: any, key: string) => {
    const metadata = {
      key,
      classname: target.constructor.name,
      type: 'many-to-one',
      options: {
        ...options,
        referencedClassname: referenceClass,
        referencedKey: getPropertyName(fn),
      },
    };

    const existingData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, target) || [];
    existingData.push(metadata);
    Reflect.defineMetadata(PROPERTY_DECORATOR_METADATA_KEY, existingData, target);
  };
}

export function OneToOne<T>(referenceClass: string, fn: PropertyGetter<T>, options?: ColumnDecoratorOptions) {
  return (target: any, key: string) => {
    const metadata = {
      key,
      classname: target.constructor.name,
      type: 'one-to-one',
      options: {
        referencedClassname: referenceClass,
        referencedKey: getPropertyName(fn),
        ...options,
      },
    };

    const existingData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, target) || [];
    existingData.push(metadata);
    Reflect.defineMetadata(PROPERTY_DECORATOR_METADATA_KEY, existingData, target);
  };
}

/**
 * Use on class properties to indicate that the property is a one-to-many relationship
 * @param {string} referenceClass -- class name this relationship will reference
 * @param {PropertyGetter<T>} fn -- function to get the property to reference
 */
export function OneToMany<T>(referenceClass: string, fn: PropertyGetter<T>) {
  return (target: any, key: string) => {
    const metadata = {
      key,
      classname: target.constructor.name,
      type: 'one-to-many',
      options: {
        referencedClassname: referenceClass,
        referencedKey: getPropertyName(fn),
      },
    };

    const existingData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, target) || [];
    existingData.push(metadata);
    Reflect.defineMetadata(PROPERTY_DECORATOR_METADATA_KEY, existingData, target);
  };
}

export function JoinOne<T>(referenceClass: string, fn: PropertyGetter<T> | MultiPropertyGetter<T>) {
  return (target: any, key: string) => {
    const metadata = {
      key,
      classname: target.constructor.name,
      type: 'join-one',
      options: {
        referencedClassname: referenceClass,
        referencedKeys: fn(target),
      },
    };

    const existingData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, target) || [];
    existingData.push(metadata);
    Reflect.defineMetadata(PROPERTY_DECORATOR_METADATA_KEY, existingData, target);
  };
}

export function JoinMany<T>(referenceClass: string, fn: PropertyGetter<T> | MultiPropertyGetter<T>) {
  return (target: any, key: string) => {
    const metadata = {
      key,
      classname: target.constructor.name,
      type: 'join-many',
      options: {
        referencedClassname: referenceClass,
        referencedKeys: fn(target),
      },
    };

    const existingData = Reflect.getMetadata(PROPERTY_DECORATOR_METADATA_KEY, target) || [];
    existingData.push(metadata);
    Reflect.defineMetadata(PROPERTY_DECORATOR_METADATA_KEY, existingData, target);
  };
}
