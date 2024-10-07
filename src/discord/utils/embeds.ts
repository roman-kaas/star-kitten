import { EmbedBuilder } from "@discordjs/builders";

export const WHITE_SPACE = '    ';
export const BREAKING_WHITE_SPACE = '\u200b';

export const MAX_TITLE_LENGTH = 256;
export const MAX_DESCRIPTION_LENGTH = 4096;
export const MAX_EMBED_FIELDS = 25;
export const MAX_FIELD_NAME_LENGTH = 256;
export const MAX_FIELD_VALUE_LENGTH = 1024;
export const MAX_FOOTER_TEXT_LENGTH = 2048;
export const MAX_AUTHOR_NAME_LENGTH = 256;
export const MAX_EMBED_COUNT = 10;
export const MAX_CHARACTERS = 6000;


export interface ColumnFieldValues {
  name: string;
  values: string[];
  inline: boolean;
}


export const renderText = (text?: string, maxLength: number = MAX_FIELD_VALUE_LENGTH) => {
  if (!text || text === '') return BREAKING_WHITE_SPACE;
  return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + '...';
}

export const renderField = (name: string = BREAKING_WHITE_SPACE, value: string = BREAKING_WHITE_SPACE, inline: boolean = true) => {
  return {
    name: renderText(name),
    value: renderText(value),
    inline,
  };
}

export const triplet = (...columns: [Partial<ColumnFieldValues>, Partial<ColumnFieldValues>, Partial<ColumnFieldValues>]) =>
  columns.map((col) => renderField(col.name, col.values?.join('\n'), col.inline));

export function renderThreeColumns(title: string, col1: string[], col2: string[], col3: string[]) {
  const fields = [];
  let counter = [0, 0, 0];
  let first = true;
  let len = col1.length || col2.length || col3.length;
  for (let i = 0; i < len; ++i) {
    // count string length for each column and store in counter
    counter[0] += col1[i]?.length ?? 0 + 2;
    counter[1] += col2[i]?.length ?? 0 + 2;
    counter[2] += col3[i]?.length ?? 0 + 2;

    // if any column exceeds max length, push to fields and reset counter
    if (counter[0] > MAX_FIELD_VALUE_LENGTH || counter[1] > MAX_FIELD_VALUE_LENGTH || counter[2] > MAX_FIELD_VALUE_LENGTH || i > 9) {
      --i; // decrement since this iteration exceeds max length
      fields.push(...triplet(
        { values: col1.slice(0, i), name: first ? title : BREAKING_WHITE_SPACE },
        { values: col2.slice(0, i) },
        { values: col3.slice(0, i) }
      ));
      col1 = col1.slice(i);
      col2 = col2.slice(i);
      col3 = col3.slice(i);

      counter = [0, 0, 0];

      first = false;
      i = 0;
    } else if (i == col1.length - 1) {
      fields.push(...triplet(
        { values: col1, name: first ? title : BREAKING_WHITE_SPACE },
        { values: col2 },
        { values: col3 }
      ));
      break;
    }
  }
  return fields;
}

export function validateEmbeds(...embeds: EmbedBuilder[]) {
  let characterCount = 0;

  if (embeds.length > MAX_EMBED_COUNT) {
    throw new Error(`Embed count exceeds ${MAX_EMBED_COUNT}`);
  }

  for (const embed of embeds) {
    if (embed.data.title) {
      if (embed.data.title.length > MAX_TITLE_LENGTH) {
        throw new Error(`Title exceeds ${MAX_TITLE_LENGTH} characters`);
      }
      if (embed.data.title === '') {
        throw new Error('Title cannot be an empty string');
      }
      characterCount += embed.data.title.length;
    }

    if (embed.data.description) {
      if (embed.data.description.length > MAX_DESCRIPTION_LENGTH) {
        throw new Error(`Description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
      }
      if (embed.data.description === '') {
        throw new Error('Description cannot be an empty string');
      }
      characterCount += embed.data.description.length;
    }

    if (embed.data.footer) {
      if (embed.data.footer.text.length > MAX_FOOTER_TEXT_LENGTH) {
        throw new Error(`Footer text exceeds ${MAX_FOOTER_TEXT_LENGTH} characters`);
      }
      if (embed.data.footer.text === '') {
        throw new Error('Footer text cannot be an empty string');
      }
      characterCount += embed.data.footer.text.length;
    }

    if (embed.data.author) {
      if (embed.data.author.name.length > MAX_AUTHOR_NAME_LENGTH) {
        throw new Error(`Author name exceeds ${MAX_AUTHOR_NAME_LENGTH} characters`);
      }
      if (embed.data.author.name === '') {
        throw new Error('Author name cannot be an empty string');
      }
      characterCount += embed.data.author.name.length;
    }

    if (embed.data.fields) {
      if (embed.data.fields.length > MAX_EMBED_FIELDS) {
        throw new Error(`Fields exceed ${MAX_EMBED_FIELDS}`);
      }
      for (const field of embed.data.fields) {
        if (field.name.length > MAX_FIELD_NAME_LENGTH) {
          throw new Error(`Field name exceeds ${MAX_FIELD_NAME_LENGTH} characters`);
        }
        if (field.name === '') {
          throw new Error('Field name cannot be an empty string');
        }
        characterCount += field.name.length;

        if (field.value.length > MAX_FIELD_VALUE_LENGTH) {
          throw new Error(`Field value exceeds ${MAX_FIELD_VALUE_LENGTH} characters`);
        }
        if (field.value === '') {
          throw new Error('Field value cannot be an empty string');
        }
        characterCount += field.value.length;
      }
    }
  }

  if (characterCount > MAX_CHARACTERS) {
    throw new Error(`Total characters exceed ${MAX_CHARACTERS}`);
  }
}


export function errorEmbed(message: string) {
  return new EmbedBuilder()
    .setTitle('Oh No!')
    .setDescription(`ERROR: Failed to generate response: "${message}"\n\nPlease notify the developer if you encounter this error.`)
    .setColor(0xff0000)
    .setThumbnail('https://imgcdn.dev/i/FieM0');
}

export function errorResponse(message: string) {
  return {
    embeds: [errorEmbed(message)],
    ephemeral: true,
  };
}
