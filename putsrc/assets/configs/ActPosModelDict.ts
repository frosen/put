/*
 * ActPosModelDict.ts
 * 位置信息
 * luleyan
 */

import { ActPosModel, ActPosType } from '../scripts/DataModel';
import { DrinkModelDict } from './DrinkModelDict';
import { EqpAmplrModelDict } from './EqpAmplrModelDict';
import { EquipModelDict } from './EquipModelDict';
import { PetModelDict } from './PetModelDict';
import { QuestModelDict } from './QuestModelDict';

const p = PetModelDict;
const e = EquipModelDict;
const eI = EqpAmplrModelDict;
const dI = DrinkModelDict;
const q = QuestModelDict;

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
    static work = 'work';
    static quester = 'quester';
    static aCntr = 'awardsCenter';
    static rcclr = 'recycler';
    static merger = 'merger';
}

export const ActPosModelDict: { [key: string]: ActPosModel } = {
    [PosN.YiShanJiDi]: {
        id: PosN.YiShanJiDi,
        cnName: '亦山基地',
        lv: 1,
        type: ActPosType.town,
        evts: [],
        actMDict: {
            [PAKey.shop]: {
                goodsIdList: [eI.DaMoShi.id, eI.DaMoShi.id, dI.LingGanYaoJi1.id]
            },
            [PAKey.eqpMkt]: {
                eqpIdLists: [
                    [e.DuanJian.id, e.ChangRenJian.id],
                    [e.TieZhiYuGan.id, e.JingZhiYuGan.id]
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
                questIdList: [q.LingJianHuiShou.id, q.CeShiBaoGao.id, q.GuiXunYuChengFa.id, q.AnQuanSongDa.id, q.HuiYiTongZhi.id]
            },
            [PAKey.aCntr]: {
                awardList: [
                    { need: 1, price: 25, fullId: eI.DaMoShi.id },
                    { need: 2, price: 250, fullId: eI.DaMoShi.id },
                    { need: 3, price: 25, fullId: eI.DaMoShi.id },
                    { need: 4, price: 250, fullId: eI.DaMoShi.id }
                ]
            },
            [PAKey.rcclr]: {},
            [PAKey.merger]: {}
        },
        movs: [{ id: PosN.KeChuangXiaoJing, price: 0 }],
        loc: { x: 1000, y: 100 }
    },
    [PosN.KeChuangXiaoJing]: {
        id: PosN.KeChuangXiaoJing,
        cnName: '科创小径',
        lv: 30,
        type: ActPosType.wild,
        evts: [],
        actMDict: {
            [PAKey.expl]: {
                stepMax: 2,
                petIdLists: [
                    [p.NeiRanJiShou.id, p.FangShengJiXieBi.id, p.YaHuHanJuRen.id, p.ZiJingMieHuoQi.id, p.CaoPingShouGeZhe.id],
                    [p.NeiRanJiShou.id, p.FangShengJiXieBi.id, p.ZiJingMieHuoQi.id, p.ShuiLengJiQiRen.id, p.DianZiShouWei.id]
                ],
                itemIdLists: [[eI.DaMoShi.id], [eI.DaMoShi.id]],
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
        loc: { x: 1100, y: 100 }
    },
    [PosN.GuangJiDianGongChang]: {
        id: PosN.GuangJiDianGongChang,
        cnName: '光机电工厂',
        lv: 5,
        type: ActPosType.wild,
        evts: [],
        actMDict: {
            [PAKey.expl]: {
                stepMax: 2,
                petIdLists: [
                    [p.NeiRanJiShou.id, p.FangShengJiXieBi.id, p.YaHuHanJuRen.id, p.ZiJingMieHuoQi.id, p.CaoPingShouGeZhe.id],
                    [p.NeiRanJiShou.id, p.FangShengJiXieBi.id, p.ZiJingMieHuoQi.id, p.ShuiLengJiQiRen.id, p.DianZiShouWei.id]
                ],
                itemIdLists: [[eI.DaMoShi.id], [eI.DaMoShi.id]],
                eqpIdLists: []
            }
        },
        movs: [{ id: PosN.KeChuangXiaoJing, price: 0 }],
        loc: { x: 1100, y: 100 }
    }
};
