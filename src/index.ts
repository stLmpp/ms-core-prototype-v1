import { writeFile } from 'node:fs/promises';

import fastGlob from 'fast-glob';
import { pathExists } from 'fs-extra';

const GLOB_HTTP = 'src/http/**/{GET,POST,PUT,PATCH,DELETE}.ts';
const QUEUE_PATH = 'src/queue/index.ts';

async function generate_index() {
  const http_paths = await fastGlob(GLOB_HTTP);
  const queue_path_exists = await pathExists(QUEUE_PATH);
  // The ideia here is to generate the main.ts file with all imports
  await writeFile(
    'src/main.ts',
    `import { type ApiConfig } from './index.js';\n
${http_paths
  .map(
    (http_path, index) =>
      `import path_${index} from '${http_path.replace(/\.ts$/, '.js')}';`
  )
  .join('\n')}
${queue_path_exists ? `import queue from '${QUEUE_PATH.replace(/\.ts$/, '.js')}';\n` : ''}
const http_end_points = [
  ${http_paths
    .map((http_path, index) => `{ config: path_${index}, path: '${http_path}' },`)
    .join('\n  ')}
] as const;
    
const queue_config: ApiConfig | null = ${queue_path_exists ? 'queue' : 'null'};`
  );
}

generate_index();
