/*
 * BuffModelDict.ts
 * 持续效果
 * luleyan
 */

import { Buff } from 'scripts/Memory';
import { BattleController, BattlePet } from 'pages/page_act_exploration/scripts/BattleController';

const BuffModelDict: { [key: string]: Buff } = {
    RanShao: {
        id: 'RanShao',
        cnName: '燃烧',
        brief: '燃',
        onBegan(thisPet: BattlePet, caster: BattlePet, ctrlr: BattleController) {},
        onEnd(thisPet: BattlePet, caster: BattlePet, ctrlr: BattleController) {},
        onTurnEnd(thisPet: BattlePet, caster: BattlePet, ctrlr: BattleController) {
            thisPet.hp -= caster.pet2.getSklDmg();
        }
    },
    JingJie: {
        id: 'JingJie',
        cnName: '警戒',
        brief: '警',
        onBegan(thisPet: BattlePet, caster: BattlePet, ctrlr: BattleController) {},
        onEnd(thisPet: BattlePet, caster: BattlePet, ctrlr: BattleController) {},
        onTurnEnd(thisPet: BattlePet, caster: BattlePet, ctrlr: BattleController) {}
    }
};

export default BuffModelDict;
