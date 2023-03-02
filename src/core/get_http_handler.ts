import { type Injector } from '@stlmpp/di';
import { type RequestHandler } from 'express';

import { format_headers } from './format-headers.js';
import { format_query } from './format-query.js';
import { api_config_http_schema, type ApiConfig } from './http-config.js';
import { method_has_body } from './method-has-body.js';

interface InternalHttpHandler {
  end_point: string;
  handler: RequestHandler;
}

function parse_path(path: string) {
  const path_array = path
    .replace(/^src\/http/, '')
    .split('/')
    .map((part) => part.replace(/^\[/, ':').replace(/]$/, ''));
  const method = path_array.pop()!.toLowerCase().replace(/\.ts$/, '');
  return {
    method,
    end_point: `${path_array.join('/')}/`,
  };
}

export async function get_http_handler(
  unparsed_config: ApiConfig,
  path: string,
  injector: Injector
): Promise<InternalHttpHandler> {
  const parsed_config = await api_config_http_schema.safeParseAsync(unparsed_config);
  if (!parsed_config.success) {
    throw new Error(`${path} has invalid config`); // TODO better error message
  }
  const config = parsed_config.data;
  const { end_point, method } = parse_path(path);
  const services = await injector.resolveMany(config.imports ?? []);
  return {
    end_point, // TODO end-point
    handler: async (req, res, next) => {
      if (req.method.toLowerCase() !== method) {
        next();
        return;
      }
      let params: Record<string, string> = {};
      if (config.request?.params) {
        params = await config.request.params.parseAsync(req.params); // TODO safeParse
      }
      let query: Record<string, string> = {};
      if (config.request?.query) {
        query = await config.request.query.parseAsync(format_query(req.query)); // TODO safeParse
      }
      let headers: Record<string, string> = {};
      if (config.request?.headers) {
        headers = await config.request.headers.parseAsync(format_headers(req.headers)); // TODO safeParse
      }
      let body: unknown | undefined = undefined;
      if (method_has_body(method) && config.request?.body) {
        body = await config.request.body.parseAsync(req.body);
      }
      const { statusCode, data } = await config.handler(
        {
          params,
          body,
          headers,
          query,
        },
        ...services
      );
      res.status(statusCode).send(data);
    },
  };
}
