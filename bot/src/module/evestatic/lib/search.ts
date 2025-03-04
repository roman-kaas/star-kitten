import { sanitize } from 'sanitize.js';
import { create, insert, search } from '@orama/orama';
import { getType, typeData, type Type } from '../../../../../star-kitten-lib/src/eve/models/type';

const db = create({
  schema: {
    type_id: 'number',
    name: {
      en: 'string',
      de: 'string',
      fr: 'string',
      ru: 'string',
      ja: 'string',
      zh: 'string',
    },
  }
});

const addType = async (type: Type) => await insert(db, {
  type_id: type.type_id,
  name: type.name,
});

export async function initialize() {
  for (const type of Object.values(typeData)) {
    await addType(type);
  }
}

export async function typeSearch(name: string) {
  const sanitizedName = sanitize(name);
  if (sanitizedName.length > 100) return null;
  const results = await search(db, {
    term: sanitizedName,
    limit: 1,
    tolerance: 1,
  });
  if (!results || results.count === 0) return null;
  return getType(results.hits[0].document.type_id);
}

