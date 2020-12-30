/*
 * SpcBtlDict.ts
 * 特殊战斗（Boss战）
 * luleyan
 */

export class SpcBtlN {
    static KuangBaoHeXin = 'KuangBaoHeXin';
}

import { SpcBtlModel, BossType } from '../scripts/DataModel';
import { PetModelDict } from './PetModelDict';

export const SpcBtlModelDict: { [key: string]: SpcBtlModel } = {
    [SpcBtlN.KuangBaoHeXin]: {
        id: SpcBtlN.KuangBaoHeXin,
        pets: [
            {
                id: PetModelDict.DianZiShouWei.id,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetModelDict.DianZiShouWei.id,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetModelDict.DianZiShouWei.id,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetModelDict.DianZiShouWei.id,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            }
        ]
    }
};
