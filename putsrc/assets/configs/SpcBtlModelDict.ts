/*
 * SpcBtlDict.ts
 * 特殊战斗（Boss战）
 * luleyan
 */

export class SpcBtlN {
    static KuangBaoHeXin = 'KuangBaoHeXin';
}

import { SpcBtlModel, BossType } from '../scripts/DataModel';
import { FtN } from './FeatureModelDict';
import { PetN } from './PetModelDict';

export const SpcBtlModelDict: { [key: string]: SpcBtlModel } = {
    [SpcBtlN.KuangBaoHeXin]: {
        id: SpcBtlN.KuangBaoHeXin,
        pets: [
            {
                id: PetN.DianZiShouWei,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetN.DianZiShouWei,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetN.DianZiShouWei,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetN.DianZiShouWei,
                lv: 10,
                ampl: 3,
                features: [],
                bossType: BossType.sub
            },
            {
                id: PetN.HeZiHeXin,
                lv: 10,
                ampl: 3,
                features: [
                    { id: FtN.bossUlti, lv: 1 },
                    { id: FtN.lightBomb, lv: 1 }
                ],
                bossName: '狂暴核心',
                bossType: BossType.main
            }
        ]
    }
};
