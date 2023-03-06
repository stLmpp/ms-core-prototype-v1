import { Injector } from '@stlmpp/di';
import { createHttpHandler, createQueueHandler } from './core/create-http-handler.js';
import path_0 from 'src/http/GET.js';import path_1 from 'src/http/POST.js';import path_2 from 'src/http/[id]/GET.js';
import queue_0 from 'src/queue/cm-event-handler.js';import queue_1 from 'src/queue/index.js';
const injector = Injector.create('Main'),
[api,
queue_0_handler,queue_1_handler
] = await Promise.all([createHttpHandler([
{config:path_0,path:'src/http/GET.ts'},{config:path_1,path:'src/http/POST.ts'},{config:path_2,path:'src/http/[id]/GET.ts'}], injector),
createQueueHandler({path:'src/queue/cm-event-handler.ts',config:queue_0}, injector),createQueueHandler({path:'src/queue/index.ts',config:queue_1}, injector)
]);
export {api, queue_0_handler,queue_1_handler};
