import { SessionData } from '@irsdk-node/types';
import * as yaml from 'js-yaml';

export class IbtSessionInfo {
  data: SessionData;

  constructor(buffer: Buffer) {
    this.data = yaml.load(buffer.toString('ascii')) as SessionData;
  }

  static fromBuffer = (buffer: Buffer) => {
    return new IbtSessionInfo(buffer);
  };
}
