import { join, sep } from 'node:path';
import { Elysia } from 'elysia';
import { Glob } from 'bun';

export default async (
  app: Elysia,
  options?: {
    routeDir?: string; // default: src
    pattern?: string; // default: **/*route.{ts,js}
  },
): Promise<Elysia> => {
  const routeDir = options?.routeDir || 'src';
  const pattern = options?.pattern || '**/*route.{ts,js}';

  const absoluteDir = join(process.cwd(), routeDir);
  console.debug(`Loading routes from: ${absoluteDir} with pattern: ${pattern}`);
  const glob = new Glob(pattern);

  for await (const file of glob.scan({ cwd: absoluteDir, absolute: true })) {
    const { default: route } = await import(file);
    const fileDir = file
      .replace(absoluteDir, '')
      .replace('module', '')
      .split(sep)
      .slice(0, -1)
      .join('/')
      .replace('//', '/');
    const group = new Elysia({ prefix: fileDir });

    console.debug(`Adding route: ${fileDir}`);
    app.use(route(group));
  }

  return app;
};
