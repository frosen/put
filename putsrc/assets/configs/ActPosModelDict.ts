/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, PAKey, ActPosType } from 'scripts/DataModel';

export const actPosModelDict: { [key: string]: ActPosModel } = {
    YiZhuangJiDi: {
        id: 'YiZhuangJiDi',
        cnName: '易庄基地',
        lv: 1,
        type: ActPosType.town,
        evts: [],
        actMDict: {
            [PAKey.shop]: {
                goodsIdList: ['DaMoShi', 'DaMoShi', 'LingGanYaoJi1']
            },
            [PAKey.eqpMkt]: {
                eqpIdLists: [
                    ['DuanJian', 'ChangRenJian'],
                    ['TieZhiYuGan', 'JingZhiYuGan']
                ]
            },
            [PAKey.petMkt]: {
                petIdLists: [
                    ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'CaoPingShouGeZhe'],
                    ['ShuiLengJiQiRen', 'DianZiShouWei']
                ]
            },
            [PAKey.work]: {},
            [PAKey.quester]: {
                questIdList: ['LingJianHuiShou', 'CeShiBaoGao', 'GuiXunYuChengFa', 'AnQuanSongDa', 'HuiYiTongZhi']
            },
            [PAKey.aCntr]: {
                awardList: [
                    { need: 1, price: 25, fullId: 'DaMoShi' },
                    { need: 2, price: 250, fullId: 'DaMoShi' },
                    { need: 3, price: 25, fullId: 'DaMoShi' },
                    { need: 4, price: 250, fullId: 'DaMoShi' }
                ]
            },
            [PAKey.rcclr]: {}
        },
        movs: [
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 },
            { id: 'GuangJiDianZhiLu', price: 0 }
        ],
        loc: { x: 1000, y: 100 }
    },
    GuangJiDianZhiLu: {
        id: 'GuangJiDianZhiLu',
        cnName: '光机电之路',
        lv: 1,
        type: ActPosType.wild,
        evts: [],
        actMDict: {
            [PAKey.expl]: {
                stepMax: 2,
                petIdLists: [
                    ['NeiRanJiShou', 'FangShengJiXieBi', 'YaHuHanJuRen', 'ZiJingMieHuoQi', 'CaoPingShouGeZhe'],
                    ['NeiRanJiShou', 'FangShengJiXieBi', 'ZiJingMieHuoQi', 'ShuiLengJiQiRen', 'DianZiShouWei']
                ],
                itemIdLists: [['DaMoShi'], ['DaMoShi']],
                eqpIdLists: []
            }
        },
        movs: [
            { id: 'YiZhuangJiDi', price: 0 },
            { id: 'YiZhuangJiDi', price: 0 },
            { id: 'YiZhuangJiDi', price: 0 },
            { id: 'YiZhuangJiDi', price: 0 },
            { id: 'YiZhuangJiDi', price: 0 },
            { id: 'YiZhuangJiDi', price: 0 }
        ],
        loc: { x: 1100, y: 100 }
    }
};
