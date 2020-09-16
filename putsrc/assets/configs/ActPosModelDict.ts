/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, PAKey, ActPosType } from 'scripts/DataModel';

export const actPosModelDict: { [key: string]: ActPosModel } = {
    YiZhuang: {
        id: 'YiZhuang',
        cnName: '易庄',
        lv: 1,
        type: ActPosType.town,
        evts: [],
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
        movs: [
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 },
            { id: 'GuangJiDianDaDao', price: 0 }
        ],
        loc: { x: 1000, y: 100 },
        petIdLists: [
            null,
            ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'CaoPingShouGeZhe'],
            null,
            null,
            ['ShuiLengJiQiRen', 'DianZiShouWei']
        ],
        itemIdLists: [],
        eqpIdLists: [null, ['DuanJian', 'ChangRenJian'], null, null, ['TieZhiYuGan', 'JingZhiYuGan']],
        goodsList: ['DaMoShi', 'DaMoShi', 'LingGanYaoJi1']
    },
    GuangJiDianDaDao: {
        id: 'GuangJiDianDaDao',
        cnName: '光机电大道',
        lv: 1,
        type: ActPosType.wild,
        evts: [],
        acts: [PAKey.expl],
        actDict: {
            [PAKey.expl]: {
                key: PAKey.expl,
                stepMax: 2
            }
        },
        movs: [
            { id: 'YiZhuang', price: 0 },
            { id: 'YiZhuang', price: 0 },
            { id: 'YiZhuang', price: 0 },
            { id: 'YiZhuang', price: 0 },
            { id: 'YiZhuang', price: 0 },
            { id: 'YiZhuang', price: 0 }
        ],
        loc: { x: 1100, y: 100 },
        petIdLists: [
            null,
            ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'CaoPingShouGeZhe'],
            null,
            null,
            ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'ShuiLengJiQiRen', 'DianZiShouWei']
        ],
        itemIdLists: [null, ['DaMoShi'], ['DaMoShi'], ['DaMoShi'], ['DaMoShi']],
        eqpIdLists: [],
        goodsList: []
    }
};
