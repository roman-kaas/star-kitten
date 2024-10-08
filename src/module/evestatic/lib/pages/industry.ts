import { renderThreeColumns, type Page } from '$discord';
import { EmbedBuilder } from 'discord.js';
import { getBlueprint, type ManufacturingActivity } from '$module/evestatic/models/blueprint';
import { getType } from '$module/evestatic/models/type';
import { getSchematic } from '$module/evestatic/models/schematic';
import type { PageKey, TypeContext } from '../ItemLookup';

export function industryPage(key: PageKey.INDUSTRY, locale: string = 'en'): Page<TypeContext> {
  return {
    key,
    content: async (context: TypeContext) => {
      const type = context.type;
      const embed = new EmbedBuilder()
        .setTitle(type.name[locale] ?? type.name.en)
        .setThumbnail(type.iconUrl)
        .setURL(type.eveRefLink)
        .setFooter({ text: `id: ${type.type_id}` })
        .setColor('Green');

      let description = '';

      const fields = [];
      const bps = type.blueprints;
      if (bps.length > 0) {
        bps.map((bp) => {
          const type = bp.blueprint;
          const blueprint = getBlueprint(bp.blueprint.type_id);
          const activity = blueprint.activities[bp.activity];

          description += `### Blueprint\n`;
          description += `[${type.name[locale] ?? type.name.en}](${type.eveRefLink})\n`;
          // fields.push({
          //   name: 'Blueprints',
          //   value: bps.map(bp => {
          //     const type = bp.blueprint;
          //     return `[${type.name[locale] ?? type.name.en}](${type.eveRefLink})`;
          //   })
          // });

          if (activity['materials']) {
            const manufacturing = activity as ManufacturingActivity;
            if (manufacturing.materials) {
              description += '### Materials\n```';
              description += Object.values(manufacturing.materials)
                .map((m) => {
                  const t = getType(m.type_id);
                  return `${t.name[locale] ?? t.name.en} ${m.quantity}`;
                })
                .join('\n');
              description += '```';

              //   fields.push(...renderThreeColumns(
              //     'Materials',
              //     Object.values(manufacturing.materials).map(m => {
              //       const t = getType(m.type_id);
              //       return `[${t.name[locale] ?? t.name.en}](${t.eveRefLink})`;
              //     }),
              //     [],
              //     Object.values(manufacturing.materials).map(m => {
              //       const t = getType(m.type_id);
              //       return `x**${m.quantity}**`;
              //     }),
              //   ));
            }
          }
        });
      }

      const schematics = type.schematics;
      if (schematics.length > 0) {
        schematics.map((type) => {
          const schematic = getSchematic(type.type_id);

          fields.push({
            name: 'Schematic',
            value: `[${type.name[locale] ?? type.name.en}](${type.eveRefLink})`,
          });

          fields.push(
            ...renderThreeColumns(
              'Materials',
              Object.values(schematic.materials).map((m) => {
                const t = getType(m.type_id);
                return `[${t.name[locale] ?? t.name.en}](${t.eveRefLink})`;
              }),
              [],
              Object.values(schematic.materials).map((m) => {
                return `x**${m.quantity}**`;
              }),
            ),
          );
        });
      }

      if (description === '') {
        description = 'No blueprints or schematics found';
      }

      embed.addFields(fields);
      embed.setDescription(description);
      return {
        type: 'page',
        embeds: [embed],
        components: [context.buildButtonRow(key, context)],
      };
    },
  };
}
