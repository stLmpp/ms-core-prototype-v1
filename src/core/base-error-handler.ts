import { PubSub } from '@google-cloud/pubsub';

import { type BaseError } from './error.js';

export async function base_error_handler(error: BaseError): Promise<BaseError> {
  if (error.queue) {
    const pubsub = new PubSub();
    await pubsub.topic(error.queue).publishMessage({
      json: error.error,
      attributes: {
        replyQueue: '', // TODO async hooks
        replyQueueError: '', // TODO async hooks
      },
    });
  }
  return error;
}
