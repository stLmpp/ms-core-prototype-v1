import { z } from 'zod';

import { httpConfig } from '../core/index.js';
import { PubSub } from '../core/pubsub.js';

export default httpConfig({
  request: {},
  response: z.undefined(),
  imports: [PubSub],
  handler: async (_, pubsubClient) => {
    console.log('posting to index');
    await pubsubClient.topic('index').publishMessage({
      json: {},
    });
    await pubsubClient.topic('cm-event-handler').publishMessage({
      json: {},
    });
    return {
      statusCode: 202,
      data: undefined,
    };
  },
});
