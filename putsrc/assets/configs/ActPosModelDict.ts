/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, ActPosType } from '../scripts/DataModel';
import { petModelDict } from './PetModelDict';

const p = petModelDict;

export class PAKey {
    static expl = 'exploration';
    static shop = 'shop';
    static eqpMkt = 'equipMarket';
    static petMkt = 'petMarket';
    static work = 'work';
    static quester = 'quester';
    static aCntr = 'awardsCenter';
    static rcclr = 'recycler';
    static merger = 'merger';
}

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
                    [p.NeiRanJiShou.id, p.FangShengJiXieBi.id, p.YaHuHanJuRen.id, p.ZiJingMieHuoQi.id, p.CaoPingShouGeZhe.id],
                    [p.ShuiLengJiQiRen.id, p.DianZiShouWei.id]
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
        lv: 30,
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
