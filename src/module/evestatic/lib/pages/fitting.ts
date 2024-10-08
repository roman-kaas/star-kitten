import { EmbedBuilder } from 'discord.js';
import { renderThreeColumns, type Page } from '$discord';
import { CommonAttribute } from '$module/evestatic/models/attribute';
import { getAttributeNames, getAttributeValues } from './attributes';
import { PageKey, type TypeContext } from '../ItemLookup';

export function fittingPage(key: string = PageKey.FITTING, locale: string = 'en'): Page<TypeContext> {
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

      const fields = [];

      for (const [name, attrs] of Object.entries(attrMap)) {
        if (!type.hasAnyAttribute(attrs)) continue;
        fields.push(
          ...renderThreeColumns(
            name,
            getAttributeNames(type, attrs, locale),
            [],
            getAttributeValues(type, attrs, locale),
          ),
        );
      }

      // get variants
      {
        if (type.variants.length > 0) {
          type.variants.map((v) => {
            fields.push({
              name: `${v.metaGroup.name[locale] ?? v.metaGroup.name.en} variants`,
              value: v.types.map((t) => t.renderEveRefLink(locale)).join('\n'),
            });
          });
        }
      }

      if (fields.length === 0) {
        return {
          type: 'page',
          embeds: [embed.setDescription('This item does not have any fitting attributes.')],
          components: [context.buildButtonRow(key, context)],
        };
      }

      embed.addFields(fields);
      return {
        type: 'page',
        embeds: [embed],
        components: [context.buildButtonRow(key, context)],
      };
    },
  };
}

const shipOutputAttrs = [CommonAttribute.PowergridOutput, CommonAttribute.CPUOutput];

const hardpointAttrs = [CommonAttribute.TurretHardpoints, CommonAttribute.LauncherHardpoints];

const moduleAttrs = [CommonAttribute.HighSlots, CommonAttribute.MediumSlots, CommonAttribute.LowSlots];

const rigAttrs = [CommonAttribute.RigSlots, CommonAttribute.RigSize, CommonAttribute.Calibration];

const moduleFittingAttrs = [CommonAttribute.CPUUsage, CommonAttribute.PowergridUsage, CommonAttribute.ActivationCost];

const attrMap = {
  'Ship Output': shipOutputAttrs,
  Hardpoints: hardpointAttrs,
  Modules: moduleAttrs,
  Rigs: rigAttrs,
  Fitting: moduleFittingAttrs,
};
