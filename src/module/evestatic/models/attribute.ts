import jsonData from '$data/reference-data/dogma_attributes.json';
import { getCategory, type Category } from './category';
import { getIcon, type Icon } from './icon';
import type { LocalizedString } from './sharedTypes';
import { getUnit, type Unit } from './unit';

export const attributeData: { [attribute_id: string]: Attribute } = jsonData as any;

export class Attribute {
  public readonly attribute_id: number;
  public readonly category_id: number;
  public readonly data_type: number;
  public readonly default_value: number;
  public readonly description: LocalizedString;
  public readonly high_is_good: boolean;
  public readonly icon_id?: number;
  public readonly name: string;
  public readonly published: boolean;
  public readonly stackable: boolean;
  public readonly unit_id?: number;
  public readonly display_name: LocalizedString;
  public readonly tooltip_title?: LocalizedString;
  public readonly tooltip_description?: LocalizedString;

  constructor(attribute_id: number) {
    const data = attributeData[attribute_id];
    if (!data) throw new Error(`Attribute ID ${attribute_id} not found in reference data`);
    this.attribute_id = attribute_id;
    this.category_id = data.category_id;
    this.data_type = data.data_type;
    this.default_value = data.default_value;
    this.description = data.description;
    this.high_is_good = data.high_is_good;
    this.icon_id = data.icon_id;
    this.name = data.name;
    this.published = data.published;
    this.stackable = data.stackable;
    this.unit_id = data.unit_id;
    this.display_name = data.display_name;
    this.tooltip_title = data.tooltip_title;
    this.tooltip_description = data.tooltip_description;
  }

  public get category(): Category {
    return getCategory(this.category_id);
  }

  public get icon(): Icon {
    return getIcon(this.icon_id);
  }

  public get unit(): Unit {
    if (!this.unit_id) return null;
    return getUnit(this.unit_id);
  }
}

export const getAttribute = (attribute_id: number): Attribute => new Attribute(attribute_id);

export enum CommonAttribute {
  // Structure
  StructureHitpoints = 9,
  CargoCapacity = 38,
  DroneCapacity = 283,
  DroneBandwidth = 1271,
  Mass = 4,
  Volume = 161,
  InertiaModifier = 70,
  StructureEMResistance = 113,
  StructureThermalResistance = 110,
  StructureKineticResistance = 109,
  StructureExplosiveResistance = 111,

  // Armor
  ArmorHitpoints = 265,
  ArmorEMResistance = 267,
  ArmorThermalResistance = 270,
  ArmorKineticResistance = 269,
  ArmorExplosiveResistance = 268,

  // Shield
  ShieldCapacity = 263,
  ShieldRechargeTime = 479,
  ShieldEMResistance = 271,
  ShieldThermalResistance = 274,
  ShieldKineticResistance = 273,
  ShieldExplosiveResistance = 272,

  // Electronic Resistances
  CapacitorWarfareResistance = 2045,
  StasisWebifierResistance = 2115,
  WeaponDisruptionResistance = 2113,

  // Capacitor
  CapacitorCapacity = 482,
  CapacitorRechargeTime = 55,

  // Targeting
  MaxTargetRange = 76,
  MaxLockedTargets = 192,
  SignatureRadius = 552,
  ScanResolution = 564,
  RadarSensorStrength = 208,
  MagnetometricSensorStrength = 210,
  GravimetricSensorStrength = 211,
  LadarSensorStrength = 209,

  // Jump Drive Systems
  HasJumpDrive = 861,
  JumpDriveCapacitorNeed = 898,
  MaxJumpRange = 867,
  JumpDriveFuelNeed = 866,
  JumpDriveConsumptionAmount = 868,
  FuelBayCapacity = 1549,
  ConduitJumpConsumptionAmount = 3131,
  COnduitJumpPassengerCapacity = 3133,

  // Propulsion
  MaxVelocity = 37,
  WarpSpeed = 600,

  // FITTING

  // Slots
  HighSlots = 14,
  MediumSlots = 13,
  LowSlots = 12,

  // Stats
  PowergridOutput = 11,
  CPUOutput = 48,
  TurretHardpoints = 102,
  LauncherHardpoints = 101,

  // Rigging
  RigSlots = 1137,
  RigSize = 1547,
  Calibration = 1132,

  // Module
  CPUUsage = 50,
  PowergridUsage = 30,
  ActivationCost = 6,

  // EWAR
  MaxVelocityBonus = 20,
  WarpScrambleStrength = 105,
  WarpDisruptionStrength = 2425,
  WarpDisruptionRange = 103,

  // Weapon
  DamageMultiplier = 64,
  AccuracyFalloff = 158,
  OptimalRange = 54,
  RateOfFire = 51,
  TrackingSpeed = 160,
  ReloadTime = 1795,
  ActivationTime = 73,
  UsedWithCharge1 = 604,
  UsedWithCharge2 = 605,
  ChargeSize = 128,
}
