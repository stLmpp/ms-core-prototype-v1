import { spawn } from 'node:child_process';
import { writeFile, copyFile } from 'node:fs/promises';

import { watch } from 'chokidar';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fastGlob from 'fast-glob';
import { debounceTime, skip, Subject, switchMap } from 'rxjs';

const GLOB_HTTP = 'src/http/**/{GET,POST,PUT,PATCH,DELETE}.ts';
const GLOB_QUEUE = 'src/queue/*.ts';

async function generate_index() {
  const [http_paths, queue_paths] = await Promise.all([
    fastGlob(GLOB_HTTP),
    fastGlob(GLOB_QUEUE),
  ]);
  const fileContent = `import { Injector } from '@stlmpp/di';
import { createHttpHandler, createQueueHandler } from './core/create-http-handler.js';
${http_paths
  .map(
    (http_path, index) =>
      `import path_${index} from '${http_path.replace(/\.ts$/, '.js')}'`
  )
  .join(';')};
${queue_paths
  .map(
    (queue_path, index) =>
      `import queue_${index} from '${queue_path.replace(/\.ts$/, '.js')}'`
  )
  .join(';')};
const injector = Injector.create('Main'),
[api,
${queue_paths.map((_, index) => `queue_${index}_handler`).join(`,`)}
] = await Promise.all([createHttpHandler([
${http_paths
  .map((http_path, index) => `{config:path_${index},path:'${http_path}'}`)
  .join(',')}], injector),
${queue_paths
  .map(
    (queue_path, index) =>
      `createQueueHandler({path:'${queue_path}',config:queue_${index}}, injector)`
  )
  .join(',')}
]);
export {api, ${queue_paths.map((_, index) => `queue_${index}_handler`)}};
`;
  await writeFile('src/main.ts', fileContent);
  await build({
    entryPoints: ['src/main.ts'],
    outfile: 'dist/main.js',
    sourcemap: 'inline',
    bundle: true,
    format: 'esm',
    platform: 'node',
    minify: true,
    plugins: [nodeExternalsPlugin()],
  });
  await copyFile('package.json', 'dist/package.json');
}

const watcher = watch(['src/core/**/*', 'src/http/**/*', 'src/queue/*']);
const update$ = new Subject<void>();

watcher.on('all', async () => {
  update$.next();
});

await generate_index();
spawn('firebase emulators:start --only functions,pubsub', {
  stdio: 'inherit',
  shell: true,
});

update$
  .pipe(
    debounceTime(200),
    skip(1),
    switchMap(async () => {
      console.log('event');
      await generate_index();
    })
  )
  .subscribe();
