# ibt-stream

![Github License](https://img.shields.io/badge/license-MIT-yellowgreen.svg)

## Description

Parse iRacing telemetry data using a stream.

## Installation

To install:

```
npm install ibt-stream
```

## Usage

```
import { IbtStream } from 'ibt-stream';

fs.createReadStream('./telemetry.ibt')
  .pipe(new IbtStream())
  .on('data', (data) => {
    switch (data.type) {
      case 'IbtHeader':
        console.log('Header', data.value);
        break;
      case 'IbtVarHeaders':
        console.log('VarHeaders', data.value);
        break;
      case 'IbtSessionInfo':
        console.log('SessionInfo', data.value);
        break;
      case 'IbtSample':
        console.log('Sample', data.value);
        break;
      default:
    }
  });

```

The process is CPU bound, and if you would like to stream the samples at a lower tick rate to limit CPU, you can pass in `tickRate` in the constructor options which accepts a value betwen 1 and 1000 (samples per second).

```
fs.createReadStream('./telemetry.ibt')
  .pipe(new IbtStream({ tickRate: 60 }))

```

To parse a Telemtry file from an AWS S3 Bucket

```
const s3 = new S3({ ...s3options });

const s3.getObject({ ...params }).createReadStream()
  .pipe(new IbtStream());

```

## License

    Copyright @ MIT. All rights reserved.

    Licensed under the MIT license.

## Thanks

Thanks to https://github.com/SkippyZA/ibt-telemetry for the format.
