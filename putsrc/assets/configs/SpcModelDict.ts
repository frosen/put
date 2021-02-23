/*
 * SpcModelDict.ts
 *
 * luleyan
 */

export class SpcN {
    static YiWangShuiJing = 'YiWangShuiJing';
    static HouHuiYaoJi = 'HouHuiYaoJi';
}

import { SpcModel } from '../scripts/DataModel';

export const SpcModelDict: { [key: string]: SpcModel } = {
    [SpcN.YiWangShuiJing]: {
        id: SpcN.YiWangShuiJing,
        cnName: '遗忘水晶',
        price: 1,
        tip: ''
    },
    [SpcN.HouHuiYaoJi]: {
        id: SpcN.HouHuiYaoJi,
        cnName: '后悔药剂',
        price: 1,
        tip: '用于撤回事件中的错误决定，将进度返回上次选择之前！'
    }
};
