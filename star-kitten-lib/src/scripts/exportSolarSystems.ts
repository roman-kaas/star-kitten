import { Database } from "bun:sqlite";
import { join } from "node:path";

const db = new Database(join(process.cwd(), 'data/evestatic.db'));

const query = db.query("SELECT * FROM mapSolarSystems");
const results = query.all();

const output = results.reduce((acc: any, system: any) => {
  acc[system.solarSystemID] = system;
  return acc;
}, {});

const jsonData = JSON.stringify(output, null, 2);

const fs = await import('fs/promises');
await fs.writeFile(join(process.cwd(), 'data/reference-data/solar_systems.json'), jsonData);

db.close();
