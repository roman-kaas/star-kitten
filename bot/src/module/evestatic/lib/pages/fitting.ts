import { EmbedBuilder } from 'discord.js';
import { renderThreeColumns, type Page } from '@lib/discord';
import { getAttributeNames, getAttributeValues } from './attributes';
import { PageKey, type TypeContext } from '../ItemLookup';
import {
  eveRefLink,
  getTypeIconUrl,
  getTypeVariants,
  typeHasAnyAttribute,
  CommonAttribute,
  renderTypeEveRefLink,
} from 'star-kitten-lib/eve';

export function fittingPage(key: string = PageKey.FITTING, locale: string = 'en'): Page<TypeContext> {
  return {
    key,
    content: async (context: TypeContext) => {
      const type = context.type;
      const embed = new EmbedBuilder()
        .setTitle(type.name[locale] ?? type.name.en)
        .setThumbnail(getTypeIconUrl(type))
        .setURL(eveRefLink(type.type_id))
        .setFooter({ text: `id: ${type.type_id}` })
        .setColor('Green');

      const fields = [];

      for (const [name, attrs] of Object.entries(attrMap)) {
        if (!typeHasAnyAttribute(type, attrs)) continue;
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
        if (getTypeVariants(type).length > 0) {
          getTypeVariants(type).map((v) => {
            fields.push({
              name: `${v.metaGroup.name[locale] ?? v.metaGroup.name.en} variants`,
              value: v.types.map((t) => renderTypeEveRefLink(t, locale)).join('\n'),
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
