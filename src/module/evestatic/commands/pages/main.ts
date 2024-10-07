import { type Page } from "$discord";
import { buttonRow, PageKey } from "../ship.command";
import { buildTypeEmbed } from "$module/evestatic/lib/typeEmbed";
import type { TypeContext } from "../type.command";

export function mainPage(key: string = PageKey.MAIN, locale: string = 'en'): Page<TypeContext> {
  return {
    key: 'main',
    content: async (context: TypeContext) => {
      return {
        type: 'page',
        embeds: [await buildTypeEmbed(context.type, locale)],
        components: [buttonRow(key)],
      };
    },
  }
}
