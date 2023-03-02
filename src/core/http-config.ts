import { type Except } from 'type-fest';
import { z, type ZodObject, type ZodString, type ZodType } from 'zod';

const z_type: ZodType<ZodType> = z.any();

const api_config_handler_schema = z.function().args(
  z.object({
    params: z.record(z.string()),
    query: z.record(z.string()),
    headers: z.record(z.string()),
    body: z.any().optional(),
  })
);

const api_config_base_schema = z.object({
  request: z
    .object({
      params: z_type.optional(),
      query: z_type.optional(),
      headers: z_type.optional(),
      body: z_type.optional(),
    })
    .optional(),
  response: z.any().optional(),
  errors: z.array(z.number()).optional(),
  imports: z.array(z.any()).optional(),
});

const api_config_http_handler_return_object_schema = z.object({
  statusCode: z.number(), // TODO better
  data: z.any(),
});

export const api_config_http_handler_return_schema =
  api_config_http_handler_return_object_schema.or(
    api_config_http_handler_return_object_schema.promise()
  );

export const api_config_http_schema = z
  .object({
    type: z.literal('http'),
    handler: api_config_handler_schema.returns(api_config_http_handler_return_schema),
  })
  .merge(api_config_base_schema);

const api_config_queue_handler_return_object_schema = z.object({
  // TODO correlationId
  statusCode: z.number(), // TODO better
  data: z.any(),
});

export const api_config_queue_data_schema = z.object({
  params: z.record(z.string()).optional(),
  query: z.record(z.string()).optional(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
});

export const api_config_queue_handler_return_schema =
  api_config_queue_handler_return_object_schema.or(
    api_config_queue_handler_return_object_schema.promise()
  );

export const api_config_queue_schema = z
  .object({
    handler: api_config_handler_schema.returns(api_config_queue_handler_return_schema),
    type: z.literal('queue'),
    queue: z.string(),
  })
  .merge(api_config_base_schema);

export const api_config_schema = z.discriminatedUnion('type', [
  api_config_http_schema,
  api_config_queue_schema,
]);

export type ApiConfigInput = z.input<typeof api_config_schema>;

export function httpConfig<
  Params extends ZodObject<Record<string, ZodString>>,
  Query extends ZodObject<Record<string, ZodString>>,
  Headers extends ZodObject<Record<string, ZodString>>,
  Body extends ZodType,
  Response extends ZodType
>(
  config: Except<ApiConfigInput, 'handler' | 'request' | 'response' | 'imports'> & {
    handler: (request: {
      params: z.infer<Params>;
      query: z.infer<Query>;
      headers: z.infer<Headers>;
      body?: z.infer<Body>;
    }) =>
      | { statusCode: number; data: z.input<Response> }
      | Promise<{ statusCode: number; data: z.input<Response> }>;
    request: {
      params?: Params;
      query?: Query;
      Headers?: Headers;
      body?: Body;
    };
    response: Response;
    imports?: [];
  }
): ApiConfigInput {
  return config;
}

export { ApiConfigInput as ApiConfig };
