import { PubSub as GooglePubSub } from '@google-cloud/pubsub';
import { Injectable } from '@stlmpp/di';

@Injectable({ root: true, useFactory: () => new GooglePubSub() })
export class PubSub extends GooglePubSub {}
