import { z } from 'zod';

import { queueConfig } from '../core/queue-config.js';

export default queueConfig({
  request: z.object({}),
  response: z.object({
    id: z.number(),
  }),
  handler: () => ({ id: 1 }),
});
