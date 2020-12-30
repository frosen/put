/*
 * SpcModelDict.ts
 *
 * luleyan
 */

export class SpcN {
    YiWangShuiJing = 'YiWangShuiJing';
}

import { SpcModel } from '../scripts/DataModel';

export const SpcModelDict: { [key: string]: SpcModel } = {
    YiWangShuiJing: {
        id: 'YiWangShuiJing',
        cnName: '遗忘水晶',
        price: 1
    }
};
