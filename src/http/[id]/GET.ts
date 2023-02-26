import { z } from 'zod';

import { apiConfig } from '../../api_config.js';

export default apiConfig({
  type: 'http',
  request: {},
  response: z.object({}),
  handler: () => ({
    statusCode: 200,
    data: {},
  }),
});
