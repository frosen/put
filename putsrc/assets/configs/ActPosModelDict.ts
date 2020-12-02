/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, PAKey, ActPosType } from '../scripts/DataModel';

export const actPosModelDict: { [key: string]: ActPosModel } = {
    YiShanJiDi: {
        id: 'YiShanJiDi',
        cnName: '亦山基地',
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
            [PAKey.rcclr]: {},
            [PAKey.merger]: {}
        },
        movs: [{ id: 'KeChuangXiaoJing', price: 0 }],
        loc: { x: 1000, y: 100 }
    },
    KeChuangXiaoJing: {
        id: 'KeChuangXiaoJing',
        cnName: '科创小径',
        lv: 2,
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
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'YiShanJiDi', price: 0 },
            { id: 'GuangJiDianGongChang', price: 0 }
        ],
        loc: { x: 1100, y: 100 }
    },
    GuangJiDianGongChang: {
        id: 'GuangJiDianGongChang',
        cnName: '光机电工厂',
        lv: 5,
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
        movs: [{ id: 'KeChuangXiaoJing', price: 0 }],
        loc: { x: 1100, y: 100 }
    }
};
