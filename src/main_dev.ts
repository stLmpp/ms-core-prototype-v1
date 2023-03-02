import { Injector } from '@stlmpp/di';

import { createHttpHandler, createQueueHandler } from './core/create-http-handler.js';
import { type HttpEndPoint } from './core/http-end-point.type.js';

import path_0 from 'src/http/GET.js';
import path_1 from 'src/http/[id]/GET.js';
import queue_1 from 'src/queue/index.js';

const queue_1_path = 'src/queue/index.js';

const http_end_points: HttpEndPoint[] = [
  { config: path_0, path: 'src/http/GET.ts' },
  { config: path_1, path: 'src/http/[id]/GET.ts' },
];

const injector = Injector.create('Main');

export const api = await createHttpHandler(http_end_points, injector);
export const queue_1_handler = await createQueueHandler(
  { path: queue_1_path, config: queue_1 },
  injector
);
