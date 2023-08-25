import { Parser } from "binary-parser";

interface HeaderValues {
  startDate: number;
  // startTime: number;
  // endTime: number;
  // lapCount: number;
  // recordCount: number;
}

export class IbtDiskSubheader {
  static byteSize = 32;
  static byteOffset = 112;

  data: HeaderValues;

  constructor(buffer: Buffer) {
    const parser = new Parser().int32le("startDate");
    // .floatbe("startTime")
    // .floatbe("endTime")
    // .int32le("lapCount")
    // .int32le("recordCount");
    this.data = parser.parse(buffer);
  }

  static fromBuffer = (buffer: Buffer) => {
    return new IbtDiskSubheader(buffer);
  };
}
