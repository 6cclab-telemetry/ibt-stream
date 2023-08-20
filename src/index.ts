import * as stream from "stream";
import { IbtHeader } from "./models/ibt-header";
import { IbtVarHeaders } from "./models/ibt-var-headers";
import { IbtSessionInfo } from "./models/ibt-session-info";
import { IbtSample } from "./models/ibt-sample";

interface IbtTransformOptions extends stream.TransformOptions {
  tickRate?: number;
}

export class IbtStream extends stream.Transform {
  private bytesRead = 0;
  private buffers: Buffer[] = [];
  private sampleBuffer: Buffer | null = null;
  private header: IbtHeader | null = null;
  private varHeaders: IbtVarHeaders[] | null = null;
  private sessionInfo: IbtSessionInfo | null = null;
  private tickRate: number | undefined;

  constructor(options?: IbtTransformOptions) {
    super({ objectMode: true });
    this.tickRate = options?.tickRate;
  }

  private parseGeneric = (
    chunk: Buffer,
    parseInto: typeof IbtHeader | typeof IbtVarHeaders | typeof IbtSessionInfo,
    objectSize: number,
    offset = 0,
    totalObjects = 1
  ): IbtHeader | IbtVarHeaders[] | IbtSessionInfo | null => {
    const endOfVarField = offset + objectSize * totalObjects;
    if (this.bytesRead >= endOfVarField) {
      const bytesLeft = endOfVarField - this.buffers.length;
      const value = parseInto.fromBuffer(
        Buffer.concat(
          this.buffers.concat(chunk.subarray(0, bytesLeft))
        ).subarray(offset, endOfVarField),
        totalObjects
      );
      this.push({ type: parseInto.name, value });
      return value;
    }
    return null;
  };

  parseSamples = async (chunk: Buffer) => {
    const sampleLength = this.header!.data.bufLen;
    if (this.sampleBuffer !== null) {
      let allData = Buffer.concat([this.sampleBuffer, chunk]);
      let totalLength = allData.length;
      let remainder = totalLength % sampleLength;
      let cutoff = totalLength - remainder;
      for (let i = 0; i < cutoff; i += sampleLength) {
        let chunk = allData.subarray(i, i + sampleLength);
        this.push({
          type: IbtSample.name,
          value: new IbtSample(chunk, this.varHeaders!).toObject(),
        });
        await new Promise((resolve) => {
          if (this.tickRate) {
            setTimeout(resolve, 1000 / this.tickRate);
          } else {
            resolve(null);
          }
        });
      }
      this.sampleBuffer = allData.subarray(cutoff, totalLength);
    } else {
      console.info("samples start", new Date());

      this.sampleBuffer = chunk.subarray(
        chunk.length - (this.bytesRead - this.header!.data.bufOffset)
      );
    }
  };

  _transform = async (
    chunk: Buffer,
    _: BufferEncoding,
    callback: stream.TransformCallback
  ) => {
    this.bytesRead += chunk.length;
    if (this.header === null)
      this.header = this.parseGeneric(
        chunk,
        IbtHeader,
        IbtHeader.byteSize
      ) as IbtHeader;
    if (this.header !== null && this.varHeaders === null)
      this.varHeaders = this.parseGeneric(
        chunk,
        IbtVarHeaders,
        IbtVarHeaders.byteSize,
        this.header.data.varHeaderOffset,
        this.header.data.numVars
      ) as IbtVarHeaders[];
    if (this.header !== null && this.sessionInfo === null)
      this.sessionInfo = this.parseGeneric(
        chunk,
        IbtSessionInfo,
        this.header.data.sessionInfoLength,
        this.header.data.sessionInfoOffset
      ) as IbtSessionInfo;

    if (this.bytesRead >= this.header.data.bufOffset) {
      await this.parseSamples(chunk);
    } else {
      this.buffers.push(chunk);
    }
    callback();
  };

  _flush = (callback: stream.TransformCallback): void => {
    console.info("samples end", new Date());
    callback();
  };
}
