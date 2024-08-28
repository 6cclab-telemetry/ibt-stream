import { IbtStream } from './index';
import { createReadStream, readFileSync } from 'fs';

async function main() {
  createReadStream(process.cwd() + '/data/data.ibt')
    .pipe(new IbtStream({ tickRate: 60 }))
    .on('data', (data) => {
      switch (data.type) {
        // case 'IbtHeader':
        //   console.log('Header', data.value);
        //   break;
        // case 'IbtVarHeaders':
        //   console.log('VarHeaders', data.value);
        //   break;
        case 'IbtSessionInfo':
          console.log('SessionInfo', data.value);
          break;
        case 'IbtSample':
          console.log('Sample', data.value.toObject().LrTempL);
          break;
        default:
      }
    });
}

main();
