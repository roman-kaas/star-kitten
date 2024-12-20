export function cleanText(input: string): string {
  return truncateText(
    replaceBoldTextMarkup(replaceItalicTextMarkup(removeColorTags(convertToDiscordLinks(trimWhitespace(input))))),
  );
}

export function truncateText(input: string, length: number = 1000): string {
  return input.length > length ? input.substring(0, length) + '...' : input;
}

export function trimWhitespace(input: string): string {
  return input.trim();
}

function replaceBoldTextMarkup(input: string): string {
  // replace all <b>name</b>, <b>name, and name</b> with **name** using regex
  const regex = /<b>([^<]*)<\/b>|<b>([^<]*)|([^<]*)<\/b>/g;
  return input.replace(regex, (match, p1, p2, p3) => {
    if (p1) return `**${p1}**`;
    if (p2) return `**${p2}**`;
    if (p3) return `**${p3}**`;
    return match;
  });
}

function replaceItalicTextMarkup(input: string): string {
  // replace all <i>name</i>, <i>name, and name</i> with *name* using regex
  const regex = /<i>([^<]*)<\/i>|<i>([^<]*)|([^<]*)<\/i>/g;
  return input.replace(regex, (match, p1, p2, p3) => {
    if (p1) return `*${p1}*`;
    if (p2) return `*${p2}*`;
    if (p3) return `*${p3}*`;
    return match;
  });
}

// function replaceItalicTextMarkup(input: string): string {
//   // replace all <i>name</i> with *name* using regex
//   const regex = /<i>(.*?)<\/i>/g;
//   return input.replace(regex, '*$1*');
// }

function removeColorTags(input: string): string {
  const regex = /<color=(?:0x)?([0-9a-fA-F]{6,8}|[a-zA-Z]+)>(.*?)<\/color>/g;
  return input.replace(regex, '$2');
}

function convertToDiscordLinks(input: string): string {
  const regex = /<a href=showinfo:(\d+)>(.*?)<\/a>/g;
  return input.replace(regex, (match, number, text) => {
    const eveRefLink = `https://everef.net/types/${number}`;
    return `[${text}](${eveRefLink})`;
  });
}

export function convertMillisecondsToTimeString(milliseconds: number): string {
  const totalSeconds = milliseconds / 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    // Include seconds if it's the only part
    parts.push(`${secs.toFixed(1)}s`);
  }

  return parts.join(' ');
}

export function convertSecondsToTimeString(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (secs > 0 || parts.length === 0) {
    // Include seconds if it's the only part
    parts.push(`${secs}s`);
  }

  return parts.join(' ');
}

export function formatNumberToShortForm(number: number, locale: string = 'en-uS') {
  let suffix = '';
  let value = number;

  if (Math.abs(number) >= 1e9) {
    value = number / 1e9;
    suffix = 'b';
  } else if (Math.abs(number) >= 1e6) {
    value = number / 1e6;
    suffix = 'M';
  } else if (Math.abs(number) >= 1e3) {
    value = number / 1e3;
    suffix = 'k';
  }

  // Format the number to have up to 4 significant digits
  const formattedValue = new Intl.NumberFormat(locale, {
    maximumSignificantDigits: 4,
  }).format(value);

  return `${formattedValue}${suffix}`;
}

export function coloredText(text: string, color: 'green' | 'blue' | 'red' | 'yellow'): string {
  switch (color) {
    case 'red':
      return '```ansi\n[2;31m' + text + '[0m```\n';
    case 'blue':
      return '```ansi\n[2;32m[2;36m[2;34m' + text + '[0m[2;36m[0m[2;32m[0m```\n';
    case 'yellow':
      return '```ansi\n[2;33m' + text + '[0m```\n';
    case 'green':
      return '```ansi\n[2;36m' + text + '[0m```\n';
  }
  return text;
}
