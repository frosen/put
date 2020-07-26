/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel } from 'scripts/DataModel';

export const actPosModelDict: { [key: string]: ActPosModel } = {
    YiZhuang: {
        id: 'YiZhuang',
        cnName: '易庄',
        lv: 1,
        acts: ['work', 'quest', 'shop', 'equipMarket', 'petMarket', 'recycler', 'store', 'awardsCenter'],
        actDict: {
            work: null,
            quest: null,
            shop: null,
            equipMarket: null,
            petMarket: null,
            recycler: null,
            store: null,
            awardsCenter: null
        },
        evts: [],
        movs: [{ id: 'GuangJiDianDaDao', price: 0, condition: {} }],
        loc: { x: 1000, y: 100 },
        petIdLists: [],
        itemIdLists: [],
        eqpIdLists: []
    },
    GuangJiDianDaDao: {
        id: 'GuangJiDianDaDao',
        cnName: '光机电大道',
        lv: 1,
        acts: ['exploration'],
        actDict: {
            exploration: {
                stepMax: 2
            }
        },
        evts: [],
        movs: [{ id: 'YiZhuang', price: 0, condition: {} }],
        loc: { x: 1100, y: 100 },
        petIdLists: [
            null,
            ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'CaoPingShouGeZhe'],
            null,
            null,
            ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'ShuiLengJiQiRen', 'DianZiShouWei']
        ],
        itemIdLists: [null, ['DaMoShi'], ['DaMoShi'], ['DaMoShi'], ['DaMoShi']],
        eqpIdLists: []
    }
};
