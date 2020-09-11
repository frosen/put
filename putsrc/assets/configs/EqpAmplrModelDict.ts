/*
 * EqpAmplrModelDict.ts
 * 数据列表，从document中转义而来
 * luleyan
 */

import { EqpAmplrModel } from 'scripts/DataModel';
  
export const eqpAmplrModelDict: { [key: string]: EqpAmplrModel } = {
    DaMoShi: {
        id: 'DaMoShi',
        cnName: '打磨石',
        lvMax: 20,
        price: 100
    },
    QiangHuaShi: {
        id: 'QiangHuaShi',
        cnName: '强化石',
        lvMax: 30,
        price: 100
    },
    JingLianShi: {
        id: 'JingLianShi',
        cnName: '精炼石',
        lvMax: 35,
        price: 100
    },
    CuiHuoShi: {
        id: 'CuiHuoShi',
        cnName: '淬火石',
        lvMax: 40,
        price: 100
    },
    DianJinShi: {
        id: 'DianJinShi',
        cnName: '点金石',
        lvMax: 45,
        price: 100
    },
    JingHeShi: {
        id: 'JingHeShi',
        cnName: '晶核石',
        lvMax: 50,
        price: 100
    }
};
