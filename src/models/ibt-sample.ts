import { IbtVarHeaders } from "./ibt-var-headers";

export class IbtSample {
  variableHeaders: IbtVarHeaders[];
  buffer: Buffer;

  constructor(buffer: Buffer, varHeaders: IbtVarHeaders[]) {
    this.buffer = buffer;
    this.variableHeaders = varHeaders;
  }

  toObject = () => {
    return this.variableHeaders.reduce(
      (accum: Record<string, string | number>, header: IbtVarHeaders) => {
        accum[header.data.name] = this.parseSample(this.buffer, header);
        return accum;
      },
      {}
    );
  };

  getParam = (sampleVariableName: string) => {
    const header = this.variableHeaders.find(
      (h) => h.data.name.toLowerCase() === sampleVariableName.toLowerCase()
    );

    if (!header) {
      return null;
    }

    const value = this.parseSample(this.buffer, header);

    const { name, description, unit } = header.data;
    return {
      name,
      description,
      value: this.parseSample(this.buffer, header),
      unit,
    };
  };

  private parseSample = (
    buffer: Buffer,
    header: IbtVarHeaders
  ): string | number => {
    const headerType = header.data.type;
    const slice = buffer.subarray(
      header.data.offset,
      header.data.offset + header.size()
    );
    switch (headerType) {
      case 0:
        return slice.toString();
        break;
      case 1:
        return slice.readInt8();
        break;
      case 2:
        return slice.readInt32LE();
        break;
      case 3:
        return slice.readUInt32LE();
        break;
      case 4:
        return slice.readFloatLE();
        break;
      case 5:
        return slice.readDoubleLE();
        break;
      default:
        throw new Error("Unknown Header type");
    }
  };
}
