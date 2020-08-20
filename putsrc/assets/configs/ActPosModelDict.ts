/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, APAKey } from 'scripts/DataModel';

export const actPosModelDict: { [key: string]: ActPosModel } = {
    YiZhuang: {
        id: 'YiZhuang',
        cnName: '易庄',
        lv: 1,
        acts: [
            APAKey.work,
            APAKey.quest,
            APAKey.shop,
            APAKey.eqpMkt,
            APAKey.petMkt,
            APAKey.recycler,
            APAKey.store,
            APAKey.aCenter
        ],
        actDict: {
            [APAKey.work]: null,
            [APAKey.quest]: null,
            [APAKey.shop]: null,
            [APAKey.eqpMkt]: null,
            [APAKey.petMkt]: null,
            [APAKey.recycler]: null,
            [APAKey.store]: null,
            [APAKey.aCenter]: null
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
        acts: [APAKey.expl],
        actDict: {
            [APAKey.expl]: {
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
