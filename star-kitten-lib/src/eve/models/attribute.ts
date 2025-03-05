import jsonData from '../../../data/reference-data/dogma_attributes.json';
import type { LocalizedString } from './sharedTypes';

export const attributeData: { [attribute_id: string]: Attribute } = jsonData as any;

export interface Attribute {
  readonly attribute_id: number;
  readonly category_id: number;
  readonly data_type: number;
  readonly default_value: number;
  readonly description: LocalizedString;
  readonly high_is_good: boolean;
  readonly icon_id?: number;
  readonly name: string;
  readonly published: boolean;
  readonly stackable: boolean;
  readonly unit_id?: number;
  readonly display_name: LocalizedString;
  readonly tooltip_title?: LocalizedString;
  readonly tooltip_description?: LocalizedString;
}

export const getAttribute = (attribute_id: number): Attribute => {
  const data = attributeData[attribute_id];
  if (!data) throw new Error(`Attribute ID ${attribute_id} not found in reference data`);
  return data;
};

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
