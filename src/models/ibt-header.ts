import { Parser } from "binary-parser";

interface HeaderValues {
  version: number;
  status: number;
  tickRate: number;
  sessionInfoUpdate: number;
  sessionInfoLength: number;
  sessionInfoOffset: number;
  numVars: number;
  varHeaderOffset: number;
  numBuf: number;
  bufLen: number;
  bufOffset: number;
}

export class IbtHeader {
  static byteSize = 112;

  private fields = [
    "version",
    "status",
    "tickRate",
    "sessionInfoUpdate",
    "sessionInfoLength",
    "sessionInfoOffset",
    "numVars",
    "varHeaderOffset",
    "numBuf",
    "bufLen",
    "unk1",
    "unk2",
    "unk3",
    "bufOffset",
  ];

  data: HeaderValues;

  constructor(buffer: Buffer) {
    let parser = new Parser();
    this.fields.forEach((element) => {
      parser = parser.int32le(element);
    });
    this.data = parser.parse(buffer);
  }

  static fromBuffer = (buffer: Buffer) => {
    return new IbtHeader(buffer);
  };
}
