import { z } from 'zod';

import { apiConfig } from '../api_config.js';

export default apiConfig({
  type: 'queue',
  queue: 'asd',
  request: {},
  response: z.object({}),
  handler: () => ({}),
});
