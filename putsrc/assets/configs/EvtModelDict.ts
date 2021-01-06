/*
 * EvtModelDict.ts
 * 事件
 * luleyan
 */

export class StoryN {}

export class SpcBtlN {
    static KuangBaoHeXin = 'KuangBaoHeXin';
}

import { SpcBtlModel, EvtModel, StoryModel, SpcBtlType } from '../scripts/DataModel';
import { FtN } from './FeatureModelDict';
import { PetN } from './PetModelDict';

export const StoryModelDict: { [key: string]: StoryModel } = {};

export const SpcBtlModelDict: { [key: string]: SpcBtlModel } = {
    [SpcBtlN.KuangBaoHeXin]: {
        id: SpcBtlN.KuangBaoHeXin,
        cnName: '破坏狂暴核心',
        lv: 30,
        type: SpcBtlType.story,
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
        ]
    }
};

export const EvtModelDict: { [key: string]: EvtModel } = Object.assign({}, StoryModelDict, SpcBtlModelDict);
