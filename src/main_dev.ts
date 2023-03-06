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

class Service1 {
  id1 = 1;
}

class Service2 {
  id2 = 2;
}

import { queueConfig } from '../dist/index.js';
import { z } from 'zod';
queueConfig({
  request: z.object({
    id: z.number(),
  }),
  response: z.object({}),
  imports: [Service1, Service2],
  handler: (request, service1, service2) => {
    service2.id2;
    return {};
  },
});
