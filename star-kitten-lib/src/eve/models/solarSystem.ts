import jsonData from '../../../data/reference-data/solar_systems.json';

export interface SolarSystem {
  readonly regionID: number;
  readonly constellationID: number;
  readonly solarSystemID: number;
  readonly solarSystemName: string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly xMin: number;
  readonly xMax: number;
  readonly yMin: number;
  readonly yMax: number;
  readonly zMin: number;
  readonly zMax: number;
  readonly luminosity: number;
  readonly border: boolean;
  readonly fringe: boolean;
  readonly corridor: boolean;
  readonly hub: boolean;
  readonly international: boolean;
  readonly regional: boolean;
  readonly security: number;
  readonly factionID: number;
  readonly radius: number;
  readonly sunTypeID: number;
  readonly securityClass: string;
}

export function getSolarSystem(solarSystemID: number): SolarSystem {
  const data = jsonData[solarSystemID];
  if (!data) throw new Error(`Solar System ID ${solarSystemID} not found in reference data`);
  return {
    ...data,
    security: parseFloat(data.security),
    radius: parseFloat(data.radius),
    sunTypeID: parseInt(data.sun_type_id, 10),
    securityClass: data.security_class ?? 'nullsec', // Default to 'nullsec' if security_class is not present
  };
}
