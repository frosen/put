/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, PAKey } from 'scripts/DataModel';

export const actPosModelDict: { [key: string]: ActPosModel } = {
    YiZhuang: {
        id: 'YiZhuang',
        cnName: '易庄',
        lv: 1,
        acts: [PAKey.work, PAKey.quest, PAKey.shop, PAKey.eqpMkt, PAKey.petMkt, PAKey.recycler, PAKey.store, PAKey.aCenter],
        actDict: {
            [PAKey.work]: null,
            [PAKey.quest]: null,
            [PAKey.shop]: null,
            [PAKey.eqpMkt]: null,
            [PAKey.petMkt]: null,
            [PAKey.recycler]: null,
            [PAKey.store]: null,
            [PAKey.aCenter]: null
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
        acts: [PAKey.expl],
        actDict: {
            [PAKey.expl]: {
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
