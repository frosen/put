/*
 * EvtModelDict.ts
 * 事件
 * luleyan
 */

export class StoryN {
    static RuZhiBaoDao = 'RuZhiBaoDao';
    static RuZhiBaoDao2 = 'RuZhiBaoDao2';
}

export class SpcBtlN {
    static KuangBaoHeXin = 'KuangBaoHeXin';
}

import { SpcBtlModel, EvtModel, StoryModel, SpcBtlType, EvtType } from '../scripts/DataModel';
import { FtN } from './FeatureModelDict';
import { PetN } from './PetModelDict';
import { PsgesDict } from './PsgesDict';

export const StoryModelDict: { [key: string]: StoryModel } = {
    [StoryN.RuZhiBaoDao]: {
        id: StoryN.RuZhiBaoDao,
        cnName: '入职报到',
        lv: 1,
        eType: EvtType.main,
        psges: PsgesDict[StoryN.RuZhiBaoDao]
    },
    [StoryN.RuZhiBaoDao2]: {
        id: StoryN.RuZhiBaoDao2,
        cnName: '入职报到2',
        lv: 1,
        eType: EvtType.main,
        startEvtId: StoryN.RuZhiBaoDao,
        psges: PsgesDict[StoryN.RuZhiBaoDao2],
        useCond: {
            startEvts: [{ id: StoryN.RuZhiBaoDao }]
        }
    }
};

export const SpcBtlModelDict: { [key: string]: SpcBtlModel } = {
    [SpcBtlN.KuangBaoHeXin]: {
        id: SpcBtlN.KuangBaoHeXin,
        cnName: '破坏狂暴核心',
        lv: 30,
        eType: EvtType.main,
        startEvtId: StoryN.RuZhiBaoDao,
        sbType: SpcBtlType.normal,
        pets: [
            { id: PetN.DianZiShouWei, lv: 10, ampl: 3 },
            { id: PetN.DianZiShouWei, lv: 10, ampl: 3 },
            { id: PetN.DianZiShouWei, lv: 10, ampl: 3 },
            { id: PetN.DianZiShouWei, lv: 10, ampl: 3 },
            {
                id: PetN.HeZiHeXin,
                lv: 10,
                ampl: 3,
                features: [
                    { id: FtN.bossUlti, lv: 1 },
                    { id: FtN.bossGetDebuff, lv: 1 },
                    { id: FtN.bossLightBomb, lv: 1 }
                ],
                name: '狂暴核心',
                main: true
            }
        ],
        useCond: {
            startEvts: [{ id: StoryN.RuZhiBaoDao, rzt: { id: SpcBtlN.KuangBaoHeXin, num: 1 } }]
        }
    }
};

export const EvtModelDict: { [key: string]: EvtModel } = Object.assign({}, StoryModelDict, SpcBtlModelDict);
