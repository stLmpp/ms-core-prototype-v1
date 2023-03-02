import { type ApiConfig } from './http-config.js';

export interface HttpEndPoint {
  config: ApiConfig;
  path: string;
}
