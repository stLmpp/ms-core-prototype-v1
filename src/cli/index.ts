import { writeFile } from 'node:fs/promises';

import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fastGlob from 'fast-glob';

const GLOB_HTTP = 'src/http/**/{GET,POST,PUT,PATCH,DELETE}.ts';
const GLOB_QUEUE = 'src/queue/**/*.ts';

async function generate_index() {
  const [http_paths, queue_paths] = await Promise.all([
    fastGlob(GLOB_HTTP),
    fastGlob(GLOB_QUEUE),
  ]);
  const fileContent = `import { Injector } from '@stlmpp/di';

import { createHttpHandler, createQueueHandler } from './core/create-http-handler.js';
import { type HttpEndPoint } from './core/http-end-point.type.js';

${http_paths
  .map(
    (http_path, index) =>
      `import path_${index} from '${http_path.replace(/\.ts$/, '.js')}';`
  )
  .join('\n')}
${queue_paths
  .map(
    (queue_path, index) =>
      `import queue_${index} from '${queue_path.replace(/\.ts$/, '.js')}';`
  )
  .join('\n')}

${queue_paths
  .map(
    (queue_path, index) =>
      `const queue_${index}_path = '${queue_path.replace(/\.ts$/, '.js')}';`
  )
  .join('\n')}
const http_end_points: HttpEndPoint[] = [
  ${http_paths
    .map((http_path, index) => `{ config: path_${index}, path: '${http_path}' },`)
    .join('\n  ')}
];
const injector = Injector.create('Main');
export const api = await createHttpHandler(http_end_points, injector);
${queue_paths
  .map(
    (queue_path, index) => `export const queue_${index}_handler = createQueueHandler(
  { path: queue_${index}_path, config: queue_${index} },
  injector
);`
  )
  .join('\n')}
`;
  await writeFile('src/main.ts', fileContent);
  await build({
    entryPoints: ['src/main.ts'],
    outfile: 'src/main.js',
    sourcemap: 'inline',
    bundle: true,
    format: 'esm',
    platform: 'node',
    minify: true,
    plugins: [nodeExternalsPlugin()],
  });
}

generate_index();
