import { Parser } from 'binary-parser';

export interface HeadverValues {
  type: number;
  offset: number;
  count: number;
  countAsTime: number;
  name: string;
  description: string;
  unit: string;
}

export class IbtVarHeaders {
  data: HeadverValues;

  typeToSizeMap = [1, 1, 4, 4, 4, 8];

  constructor(buffer: Buffer) {
    const parser = new Parser()
      .int32le('type')
      .int32le('offset')
      .int32le('count')
      .int8('countAsTime')
      .skip(3)
      .string('name', { length: 32, formatter: (e) => e.replace(/\0/g, '') })
      .string('description', { length: 64, formatter: (e) => e.replace(/\0/g, '') })
      .string('unit', { length: 32, formatter: (e) => e.replace(/\0/g, '') });
    this.data = parser.parse(buffer);
  }

  size = () => {
    return this.typeToSizeMap[this.data.type];
  };

  static byteSize = 144;

  static fromBuffer = (buffer: Buffer, count: number): IbtVarHeaders[] => {
    // const numberOfVariables = header.data.numVars;
    return Array(count)
      .fill(0)
      .map((_, count) => {
        const start = count * 144;
        const end = start + 144;
        return new IbtVarHeaders(buffer.subarray(start, end));
      });
  };
}
