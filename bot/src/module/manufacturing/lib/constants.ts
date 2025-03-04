export enum StructConfigFlag {
  SmallShips = 1 << 0,
  MediumShips = 1 << 1,
  LargeShips = 1 << 2,
  AdvSmallShips = 1 << 3,
  AdvMediumShips = 1 << 4,
  AdvLargeShips = 1 << 5,
  CapitalShips = 1 << 6,
  SuperCapitalShips = 1 << 7,
  CapitalComponents = 1 << 8,
  SuperCapitalComponents = 1 << 9,
  AdvComponents = 1 << 10,
  CapitalAdvComponents = 1 << 11,
  ModulesAndEquipment = 1 << 12,
  AmmoAndCharges = 1 << 13,
  DronesAndFighters = 1 << 14,
  CompositeReactions = 1 << 15,
  HybridReactions = 1 << 16,
  BioAndGasReactions = 1 << 17,
  StructuresAndFuelBlocks = 1 << 18,
}

export function hasConfigurationBitFlag(config: number, flag: StructConfigFlag): boolean {
  return (config & flag) === flag;
}

export function setConfigurationBitFlags(config: number, ...flags: StructConfigFlag[]): number {
  return flags.reduce((acc, flag) => acc | flag, config);
}

export function unsetConfigurationBitFlags(config: number, ...flags: StructConfigFlag[]): number {
  return flags.reduce((acc, flag) => acc & ~flag, config);
}

export function getStructConfigFlagNames(config: number): string[] {
  return Object.keys(StructConfigFlag).filter((key) => {
    const value = StructConfigFlag[key];
    return typeof value === 'number' && hasConfigurationBitFlag(config, value);
  });
}

export function allStructConfigFlagNames(): string[] {
  return Object.keys(StructConfigFlag).filter((key) => typeof StructConfigFlag[key] === 'number');
}

export enum RigMarketGroup {
  MedReproc = 2341,
  LargeReproc = 2342,
  XLReproc = 2343,
  MedCombat = 2344,
  LargeCombat = 2345,
  XLCombat = 2346,
  MedEng = 2347,
  LargeEng = 2348,
  XLEng = 2349,
}

export enum CitadelMarketGroup {
  EngineeringComplex = 2324,
  Refinery = 2327,
  Citadel = 2201,
  FactionCitadel = 2200,
}
