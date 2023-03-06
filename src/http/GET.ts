import { z } from 'zod';

import { httpConfig } from '../core/http-config.js';

export default httpConfig({
  request: {},
  response: z.object({
    id: z.number(),
  }),
  handler: () => ({
    statusCode: 200,
    data: {
      id: 1,
    },
  }),
});
