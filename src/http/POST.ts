import { PubSub } from '@google-cloud/pubsub';
import { z } from 'zod';

import { httpConfig } from '../core/index.js';

export default httpConfig({
  request: {},
  response: z.undefined(),
  handler: async () => {
    const pubsubClient = new PubSub();
    console.log('posting to index');
    await pubsubClient.topic('index').publishMessage({
      json: {},
    });
    return {
      statusCode: 202,
      data: undefined,
    };
  },
});
