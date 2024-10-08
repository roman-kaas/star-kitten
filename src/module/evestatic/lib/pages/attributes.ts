import { renderThreeColumns, type Page } from '$discord';
import { EmbedBuilder } from 'discord.js';
import { CommonAttribute } from '$module/evestatic/models/attribute';
import type { Type } from '$module/evestatic/models/type';
import attributeOrders from '$data/hoboleaks/attributeOrders.json';
import type { PageKey, TypeContext } from '../ItemLookup';

export function attributesPage(key: PageKey.ATTRIBUTES, locale: string = 'en'): Page<TypeContext> {
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

      const useOrders =
        type.group.category.category_id === 11
          ? attributeOrders['11']
          : type.group.category.category_id === 87
            ? attributeOrders['87']
            : attributeOrders.default;

      Object.entries(useOrders).map((pair) => {
        const [attributePath, attrs] = pair;
        const combined = attrs['groupedAttributes']
          ? attrs.normalAttributes.concat(...(attrs['groupedAttributes']?.map(([name, id]) => id) ?? []))
          : attrs.normalAttributes;
        if (!type.hasAnyAttribute(combined)) return;
        const split = attributePath.split('/');
        const name = split[split.length - 1];
        fields.push(
          ...renderThreeColumns(
            name,
            getAttributeNames(type, combined, locale),
            [],
            getAttributeValues(type, combined, locale),
          ),
        );
      });

      // for (const [name, attrs] of Object.entries(attrMap)) {
      //   if (!type.hasAnyAttribute(attrs)) continue;
      //   if (name === 'Cargo | Drones' && type.group.category.category_id === CommonCategory.MODULE) continue;
      //   fields.push(...renderThreeColumns(
      //     name,
      //     getAttributeNames(type, attrs, locale),
      //     [],
      //     getAttributeValues(type, attrs, locale)
      //   ));
      // }

      const embeds = [];
      // there is a max number of 24 fields per embed
      embeds.push(embed.addFields(fields.splice(0, 24)));
      while (fields.length > 0) {
        embeds.push(new EmbedBuilder().addFields(fields.splice(0, 24)));
      }
      return {
        type: 'page',
        embeds,
        components: [context.buildButtonRow(key, context)],
      };
    },
  };
}

const structureAttrs = [
  CommonAttribute.StructureHitpoints,
  CommonAttribute.Mass,
  CommonAttribute.Volume,
  CommonAttribute.InertiaModifier,
  CommonAttribute.StructureEMResistance,
  CommonAttribute.StructureThermalResistance,
  CommonAttribute.StructureKineticResistance,
  CommonAttribute.StructureExplosiveResistance,
];

const droneAttrs = [CommonAttribute.CargoCapacity, CommonAttribute.DroneBandwidth, CommonAttribute.DroneCapacity];

const armorAttrs = [
  CommonAttribute.ArmorHitpoints,
  CommonAttribute.ArmorEMResistance,
  CommonAttribute.ArmorThermalResistance,
  CommonAttribute.ArmorKineticResistance,
  CommonAttribute.ArmorExplosiveResistance,
];

const shieldAttrs = [
  CommonAttribute.ShieldCapacity,
  CommonAttribute.ShieldRechargeTime,
  CommonAttribute.ShieldEMResistance,
  CommonAttribute.ShieldThermalResistance,
  CommonAttribute.ShieldKineticResistance,
  CommonAttribute.ShieldExplosiveResistance,
];

const elResAttrs = [
  CommonAttribute.CapacitorWarfareResistance,
  CommonAttribute.StasisWebifierResistance,
  CommonAttribute.WeaponDisruptionResistance,
];

const capAttrs = [CommonAttribute.CapacitorCapacity, CommonAttribute.CapacitorRechargeTime];

const targetAttrs = [
  CommonAttribute.MaxTargetRange,
  CommonAttribute.MaxLockedTargets,
  CommonAttribute.SignatureRadius,
  CommonAttribute.ScanResolution,
  CommonAttribute.RadarSensorStrength,
  CommonAttribute.MagnetometricSensorStrength,
  CommonAttribute.GravimetricSensorStrength,
  CommonAttribute.LadarSensorStrength,
];

const jumpAttrs = [
  CommonAttribute.JumpDriveCapacitorNeed,
  CommonAttribute.MaxJumpRange,
  CommonAttribute.JumpDriveFuelNeed,
  CommonAttribute.JumpDriveConsumptionAmount,
  CommonAttribute.FuelBayCapacity,
  CommonAttribute.ConduitJumpConsumptionAmount,
  CommonAttribute.COnduitJumpPassengerCapacity,
];

const propAttrs = [CommonAttribute.MaxVelocity, CommonAttribute.WarpSpeed];

const weaponAttrs = [
  CommonAttribute.DamageMultiplier,
  CommonAttribute.AccuracyFalloff,
  CommonAttribute.OptimalRange,
  CommonAttribute.RateOfFire,
  CommonAttribute.TrackingSpeed,
  CommonAttribute.ReloadTime,
  CommonAttribute.ActivationTime,
  CommonAttribute.ChargeSize,
  CommonAttribute.UsedWithCharge1,
  CommonAttribute.UsedWithCharge2,
];

const eWarAttrs = [CommonAttribute.MaxVelocityBonus];

const attrMap = {
  Weapon: weaponAttrs,
  Structure: structureAttrs,
  Armor: armorAttrs,
  Shield: shieldAttrs,
  'Cargo | Drones': droneAttrs,
  'Electronic Resistances': elResAttrs,
  Capacitor: capAttrs,
  Targeting: targetAttrs,
  'Jump Drive Systems': jumpAttrs,
  Propulsion: propAttrs,
  'Electronic Warfare': eWarAttrs,
};

export function getAttributeNames(type: Type, ids: number[], locale: string = 'en') {
  return ids
    .map((id) => type.getAttribute(id))
    .filter((attr) => !!attr)
    .map((attr) => `> ${attr.attribute.display_name[locale] ?? attr.attribute.display_name.en}`);
}

export function getAttributeValues(type: Type, ids: number[], locale: string = 'en') {
  return ids
    .map((id) => type.getAttribute(id))
    .filter((attr) => !!attr)
    .map((attr) => `**${attr.attribute.unit?.renderValue(attr.value) ?? attr.value}**`);
}
