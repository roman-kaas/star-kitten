import { Glob } from 'bun';
import { join } from 'node:path';
import type { AppModule } from '../StarKitten';

const moduleDir = join(process.cwd(), 'src/module');
const modulePattern = '**/*.module.{js,ts}';

export async function loadModules() {
  console.debug(`Loading modules from ${moduleDir} with pattern ${modulePattern}`);
  const modules = new Map<string, AppModule>();

  const glob = new Glob(modulePattern);
  for await (const file of glob.scan({
    cwd: moduleDir,
    absolute: true,
  })) {
    const { default: module } = await import(file);
    modules.set(module.name, module);
  }
  const sortedNames = topologicalSort(Array.from(modules.values()));
  console.debug(`Initializing modules in order: ${sortedNames.join(', ')}`);
  sortedNames.map((name) => {
    console.debug(`Initializing module: ${name}`);
    const module = modules.get(name);
    module.init?.();
  });
  return modules;
}

function topologicalSort(moduleList: AppModule[]) {
  console.debug(`Sorting modules: ${moduleList.map((module) => module.name).join(', ')}`);
  const adjList = new Map();
  const inDegree = new Map();

  // Initialize the adjacency list and in-degree map
  moduleList.forEach((module) => {
    inDegree.set(module.name, module.dependencies?.length);
    module.dependencies?.forEach((dep) => {
      if (!adjList.has(dep)) {
        adjList.set(dep, []);
      }
      adjList.get(dep).push(module.name);
    });
  });

  // Initialize the queue with modules having no dependencies
  const queue = moduleList
    .filter((module) => !module.dependencies || module.dependencies.length === 0)
    .map((module) => module.name);
  const sortedOrder = [];

  while (queue.length > 0) {
    const current = queue.shift();
    sortedOrder.push(current);

    // Decrease the in-degree of dependent modules
    if (adjList.has(current)) {
      adjList.get(current).forEach((neighbor) => {
        inDegree.set(neighbor, inDegree.get(neighbor) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }
  }

  // Check for cycles
  if (sortedOrder.length !== moduleList.length) {
    throw new Error('There exists a cycle in the dependency graph');
  }

  return sortedOrder;
}
