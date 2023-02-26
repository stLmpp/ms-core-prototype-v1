import express, { type Express, json, Router } from 'express';

import { type ApiConfig } from './api_config.js';
import { get_http_handler } from './get_http_handler.js';

import path_0 from 'src/http/GET.js';
import path_1 from 'src/http/[id]/GET.js';
import queue from 'src/queue/index.js';

const http_end_points = [
  { config: path_0, path: 'src/http/GET.ts' },
  { config: path_1, path: 'src/http/[id]/GET.ts' },
] as const;

const queue_config: ApiConfig | null = queue;

export async function createApplication(): Promise<Express> {
  let handlers = await Promise.all(
    http_end_points.map((http_end_point) =>
      get_http_handler(http_end_point.config, http_end_point.path)
    )
  );
  handlers = [...handlers].sort(
    ({ end_point: end_point_a }, { end_point: end_point_b }) =>
      end_point_b.split('/').length - end_point_a.split('/').length
  );
  const router = Router();
  for (const { handler, end_point } of handlers) {
    console.log(`Registering end-point: ${end_point}`);
    router.use(end_point, handler);
  }
  return express().use(json()).use(router);
}

const app = await createApplication();
app.listen(3000);
