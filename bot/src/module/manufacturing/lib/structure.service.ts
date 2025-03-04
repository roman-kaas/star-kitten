export enum StructueCategory {
  EngineeringComplex = 1,
  Refinery = 2,
  Citadel = 3,
  NPC = 4,
}

export enum StructureSize {
  Medium = 1,
  Large = 2,
  XL = 3,
}

export const structures = [
  {
    category: StructueCategory.EngineeringComplex,
    size: StructureSize.Medium,
    name: 'Raitaru',
    typeID: 35825,
  },
  {
    category: StructueCategory.EngineeringComplex,
    size: StructureSize.Large,
    name: 'Azbel',
    typeID: 35826,
  },
  {
    category: StructueCategory.EngineeringComplex,
    size: StructureSize.XL,
    name: 'Sotiyo',
    typeID: 35827,
  },
  {
    category: StructueCategory.Refinery,
    size: StructureSize.Medium,
    name: 'Athanor',
    typeID: 35835,
  },
  {
    category: StructueCategory.Refinery,
    size: StructureSize.Large,
    name: 'Tatara',
    typeID: 35836,
  },
  {
    category: StructueCategory.Citadel,
    size: StructureSize.Medium,
    name: 'Astrahus',
    typeID: 35832,
  },
  {
    category: StructueCategory.Citadel,
    size: StructureSize.Large,
    name: 'Fortizar',
    typeID: 35833,
  },
  {
    category: StructueCategory.Citadel,
    size: StructureSize.XL,
    name: 'Keepstar',
    typeID: 35834,
  },
  {
    category: StructueCategory.NPC,
    size: StructureSize.Medium,
    name: 'NPC Station',
  },
];
