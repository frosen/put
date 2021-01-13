/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

export class PosN {
    static YiShanJiDi = 'YiShanJiDi';
    static KeChuangXiaoJing = 'KeChuangXiaoJing';
    static GuangJiDianGongChang = 'GuangJiDianGongChang';
}

export class PAKey {
    static expl = 'exploration';
    static shop = 'shop';
    static eqpMkt = 'equipMarket';
    static petMkt = 'petMarket';
    static quester = 'quester';
    static aCntr = 'awardsCenter';
    static rcclr = 'recycler';
    static merger = 'merger';
}

import { ActPosModel, ActPosType } from '../scripts/DataModel';
import { DrinkN } from './DrinkModelDict';
import { EqpAmplrN } from './EqpAmplrModelDict';
import { EquipN } from './EquipModelDict';
import { PetN } from './PetModelDict';
import { QuestN } from './QuestModelDict';
import { SpcBtlN, StoryN } from './EvtModelDict';

const p = PetN;
const e = EquipN;
const eI = EqpAmplrN;
const dI = DrinkN;
const q = QuestN;

export const ActPosModelDict: { [key: string]: ActPosModel } = {
    [PosN.YiShanJiDi]: {
        id: PosN.YiShanJiDi,
        cnName: '亦山基地',
        lv: 1,
        type: ActPosType.town,
        evtIds: [],
        actMDict: {
            [PAKey.shop]: {
                goodsIdList: [eI.DaMoShi, eI.DaMoShi, dI.LingGanYaoJi1]
            },
            [PAKey.eqpMkt]: {
                eqpIdLists: [
                    [e.DuanJian, e.ChangRenJian],
                    [e.TieZhiYuGan, e.JingZhiYuGan]
                ]
            },
            [PAKey.petMkt]: {
                petIdLists: [
                    [p.NeiRanJiShou, p.FangShengJiXieBi, p.YaHuHanJuRen, p.ZiJingMieHuoQi, p.CaoPingShouGeZhe],
                    [p.ShuiLengJiQiRen, p.DianZiShouWei]
                ]
            },
            [PAKey.quester]: {
                questIdList: [q.LingJianHuiShou, q.CeShiBaoGao, q.GuiXunYuChengFa, q.AnQuanSongDa, q.HuiYiTongZhi]
            },
            [PAKey.aCntr]: {
                awardList: [
                    { need: 1, price: 25, fullId: eI.DaMoShi },
                    { need: 2, price: 250, fullId: eI.DaMoShi },
                    { need: 3, price: 25, fullId: eI.DaMoShi },
                    { need: 4, price: 250, fullId: eI.DaMoShi }
                ]
            },
            [PAKey.rcclr]: {},
            [PAKey.merger]: {}
        },
        movs: [{ id: PosN.KeChuangXiaoJing, price: 0 }],
        loc: cc.v2(1000, 100)
    },
    [PosN.KeChuangXiaoJing]: {
        id: PosN.KeChuangXiaoJing,
        cnName: '科创小径',
        lv: 30,
        type: ActPosType.wild,
        evtIds: [StoryN.RuZhiBaoDao, SpcBtlN.KuangBaoHeXin],
        actMDict: {
            [PAKey.expl]: {
                stepMax: 2,
                petIdLists: [
                    [p.NeiRanJiShou, p.FangShengJiXieBi, p.YaHuHanJuRen, p.ZiJingMieHuoQi, p.CaoPingShouGeZhe],
                    [p.NeiRanJiShou, p.FangShengJiXieBi, p.ZiJingMieHuoQi, p.ShuiLengJiQiRen, p.DianZiShouWei]
                ],
                itemIdLists: [[eI.DaMoShi], [eI.DaMoShi]],
                eqpIdLists: []
            }
        },
        movs: [
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.YiShanJiDi, price: 0 },
            { id: PosN.GuangJiDianGongChang, price: 0 }
        ],
        loc: cc.v2(1100, 100)
    },
    [PosN.GuangJiDianGongChang]: {
        id: PosN.GuangJiDianGongChang,
        cnName: '光机电工厂',
        lv: 5,
        type: ActPosType.wild,
        evtIds: [],
        actMDict: {
            [PAKey.expl]: {
                stepMax: 2,
                petIdLists: [
                    [p.NeiRanJiShou, p.FangShengJiXieBi, p.YaHuHanJuRen, p.ZiJingMieHuoQi, p.CaoPingShouGeZhe],
                    [p.NeiRanJiShou, p.FangShengJiXieBi, p.ZiJingMieHuoQi, p.ShuiLengJiQiRen, p.DianZiShouWei]
                ],
                itemIdLists: [[eI.DaMoShi], [eI.DaMoShi]],
                eqpIdLists: []
            }
        },
        movs: [{ id: PosN.KeChuangXiaoJing, price: 0 }],
        loc: cc.v2(1000, 120)
    }
};
