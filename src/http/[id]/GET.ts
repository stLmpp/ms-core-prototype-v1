import { z } from 'zod';

import { httpConfig } from '../../core/http-config.js';

export default httpConfig({
  type: 'http',
  request: {},
  response: z.object({}),
  handler: () => ({
    statusCode: 200,
    data: {},
  }),
});
