/*
 * BattleController.ts
 * 战斗处理类
 * luleyan
 */

import { Memory, PetState, Pet, ExplorationModel, Pet2, BattleType } from 'scripts/Memory';
import PageActExploration from './PageActExploration';

import * as expModels from 'configs/ExpModels';
import * as actPosModelDict from 'configs/ActPosModelDict';
import * as petModelDict from 'configs/PetModelDict';

// random with seed -----------------------------------------------------------------

let seed = 5;
function setSeed(s: number) {
    seed = s;
}

function ranWithSeed() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
}

function ranWithSeedInt(c: number) {
    return Math.floor(ranWithSeed() * c);
}

// random -----------------------------------------------------------------

function random(c: number): number {
    return Math.floor(Math.random() * c);
}

function getRandomOneInList(list) {
    return list[random(list.length)];
}

function normalRandom(c) {
    let r = Math.random();
    if (r <= 0.5) {
        r = 0.5 - r;
        r = 0.5 - r * r * 2;
    } else {
        r = r - 0.5;
        r = 1 - r * r * 2;
    }
    return Math.floor(r * c);
}

// -----------------------------------------------------------------

const ExpRateByPetCount = [0, 1, 0.53, 0.37, 0.29, 0.23];

export class BattlePet {
    idx: number = 0;

    /** 用于标识当前位置宠物是否变化 */
    petToken: number = -1;
    lvToken: number = -1;
    eqpToken: string = '';

    fromationIdx: number = 0;
    beEnemy: boolean = false;

    last: BattlePet = null;
    next: BattlePet = null;

    pet: Pet = null;
    pet2: Pet2 = null;

    hp: number = 0;
    hpMax: number = 0;

    init(idx: number, fromationIdx: number, pet: Pet, pet2: Pet2, beEnemy: boolean) {
        this.idx = idx;
        this.fromationIdx = fromationIdx;
        this.pet = pet;
        this.pet2 = pet2;
        this.beEnemy = beEnemy;

        ({ petToken: this.petToken, lvToken: this.lvToken, eqpToken: this.eqpToken } = BattlePet.getPetToken(pet));

        this.hp = pet2.hpMax;
        this.hpMax = pet2.hpMax;
    }

    static getPetToken(pet: Pet): { petToken: number; lvToken: number; eqpToken: string } {
        let petToken = pet.catchIdx;
        let lvToken = pet.lv;
        let eqpToken = '';
        for (const equip of pet.equips) {
            eqpToken += equip.id + '!';
            for (const extra of equip.extras) {
                eqpToken += extra + '$';
            }
        }
        return { petToken, lvToken, eqpToken };
    }
}

export class RealBattle {
    start: boolean = false;

    selfPets: BattlePet[] = [];
    mpMax: number = 0;
    mp: number = 0;
    rage: number = 0;

    enemyPets: BattlePet[] = [];
    enemyPetDatas: Pet[] = [];
    enemyPet2Datas: Pet2[] = [];

    battleRound: number = 0;
    order: BattlePet[] = [];
    curOrderIdx: number = 0;

    lastAim: BattlePet = null;
    combo: number = 1;
}

const ComboHitRate = [0, 1, 1.1, 1.2]; // combo从1开始
const FormationHitRate = [1, 0.95, 0.9, 0.9, 0.85]; // 阵型顺序从0开始

export default class BattleController {
    page: PageActExploration = null;
    memory: Memory = null;
    endCallback: () => void = null;

    realBattle: RealBattle = null;

    init(page: PageActExploration, memory: Memory, endCallback: () => void) {
        this.page = page;
        this.memory = memory;
        this.endCallback = endCallback;

        this.realBattle = new RealBattle();
    }

    resetOurTeam() {
        this.realBattle.selfPets.length = 0;

        let pets = this.memory.gameData.pets;
        let pet2s = this.memory.gameData2.pet2s;

        let mpMax = 0;
        let last = null;
        for (let petIdx = 0; petIdx < pets.length; petIdx++) {
            const pet = pets[petIdx];
            if (pet.state != PetState.ready) continue;
            let pet2 = pet2s[petIdx];

            let battlePet = new BattlePet();
            battlePet.init(petIdx, 5 - pets.length + petIdx, pet, pet2, false);
            if (last) {
                battlePet.last = last;
                last.next = battlePet;
            }
            last = battlePet;

            this.realBattle.selfPets.push(battlePet);

            mpMax += pet2.mpMax;

            if (this.realBattle.selfPets.length == 5) break;
        }

        this.realBattle.mpMax = mpMax;
        this.realBattle.mp = mpMax;

        this.page.setUIofSelfPet(-1);
    }

    checkIfOurTeamChanged(): { petChange: boolean; lvChange: boolean; eqpChange: boolean } {
        let pets = this.memory.gameData.pets;
        let selfPets = this.realBattle.selfPets;
        let petChange = false;
        let lvChange = false;
        let eqpChange = false;
        for (let petIdx = 0; petIdx < selfPets.length; petIdx++) {
            const battlePet = selfPets[petIdx];
            let pet = pets[battlePet.idx];
            let { petToken, lvToken, eqpToken } = BattlePet.getPetToken(pet);
            if (!petChange) petChange = petToken != battlePet.petToken;
            if (!lvChange) lvChange = lvToken != battlePet.lvToken;
            if (!eqpChange) eqpChange = eqpToken != battlePet.eqpToken;
        }

        return { petChange, lvChange, eqpChange };
    }

    start() {
        let seed = new Date().getTime() % 999999;
        setSeed(seed);

        // 更新memory
        this.memory.createBattle(seed);

        let gameData = this.memory.gameData;
        let posId = gameData.curPosId;
        let curPosModel = actPosModelDict[posId];
        let explModel: ExplorationModel = <ExplorationModel>curPosModel.actDict['exploration'];

        let petCount = random(5) + 1;
        let step = gameData.curExploration.curStep;
        let curStepModel = explModel.stepModels[step];

        let enmeyPetType1 = getRandomOneInList(curStepModel.petIds);
        let enmeyPetType2 = getRandomOneInList(curStepModel.petIds);

        for (let index = 0; index < petCount; index++) {
            let id = Math.random() > 0.5 ? enmeyPetType1 : enmeyPetType2;
            let lv = Math.max(1, curPosModel.lv - 2 + normalRandom(5));
            let rank = normalRandom(step * 2) + 1;
            this.memory.createEnemyPet(id, lv, rank);
        }

        // 更新battle
        let rb = this.realBattle;
        rb.enemyPetDatas.length = 0;
        rb.enemyPet2Datas.length = 0;
        rb.enemyPets.length = 0;
        let enemys = gameData.curExploration.curBattleField.enemys;
        let last = null;
        for (let index = 0; index < enemys.length; index++) {
            const enemyPet = enemys[index];

            let petData = new Pet();
            petData.id = enemyPet.id;
            petData.lv = enemyPet.lv;
            petData.rank = enemyPet.rank;
            rb.enemyPetDatas.push(petData);

            let pet2Data = new Pet2();
            let petModel = petModelDict[enemyPet.id];
            pet2Data.setData(petData, petModel);
            rb.enemyPet2Datas.push(pet2Data);

            let battlePet = new BattlePet();
            battlePet.init(index, 5 - enemys.length + index, petData, pet2Data, true);
            if (last) {
                battlePet.last = last;
                last.next = battlePet;
            }
            last = battlePet;

            rb.enemyPets.push(battlePet);
        }

        rb.battleRound = 0;
        rb.order.length = 0;
        for (const pet of rb.selfPets) rb.order.push(pet);
        for (const pet of rb.enemyPets) rb.order.push(pet);

        this.page.setUIofEnemyPet(-1);

        rb.start = true;

        // 日志
        let petNames = '';
        for (const ePet of this.realBattle.enemyPets) {
            let petId = ePet.pet.id;
            let cnName = petModelDict[petId].cnName;
            petNames += cnName + ' ';
        }
        this.page.log('进入战斗：' + petNames);

        this.gotoNextRound();
    }

    update() {
        let rb = this.realBattle;

        let nextOrderIdx = this.getNextOrderIndex();
        cc.log('STORM cc ^_^ update ', nextOrderIdx);
        if (nextOrderIdx == -1) {
            this.gotoNextRound();
            nextOrderIdx = this.getNextOrderIndex();
            if (nextOrderIdx == -1) {
                cc.error('错误的update，已经没有活着的宠物了');
                return;
            }
        }

        rb.curOrderIdx = nextOrderIdx;

        // 执行当前宠物的攻击
        let curExePet: BattlePet = rb.order[nextOrderIdx];
        rb.combo = 1;
        this.attack(curExePet);

        // 执行联合攻击
        while (true) {
            if (rb.start == false) break;
            let nextNextId = this.getNextOrderIndex();
            if (nextNextId == -1) break;
            let nextPet = rb.order[nextNextId];
            if (nextPet.beEnemy != curExePet.beEnemy) break;
            rb.curOrderIdx = nextNextId;
            rb.combo++;
            cc.log('STORM cc ^_^ 连段 ', rb.combo);
            this.attack(nextPet);
            if (rb.combo >= 3) break; // 最多三连
        }
        cc.log('STORM cc ^_^ end ');
    }

    getNextOrderIndex(): number {
        let rb = this.realBattle;
        let idx = rb.curOrderIdx + 1;
        while (true) {
            if (idx >= rb.order.length) return -1;
            let curExePet = rb.order[idx];
            if (curExePet.hp > 0) {
                return idx;
            }
            idx++;
        }
    }

    gotoNextRound() {
        let rb = this.realBattle;

        // 处理buff

        // 处理速度列表
        rb.order.sort((a: BattlePet, b: BattlePet): number => {
            let sa = a.pet2.exSpeed || petModelDict[a.pet.id].speed;
            let sb = b.pet2.exSpeed || petModelDict[b.pet.id].speed;
            return sb - sa;
        });

        rb.curOrderIdx = -1;
        rb.battleRound++;
        rb.lastAim = null;

        this.page.log(`第${rb.battleRound}回合`);
    }

    attack(battlePet: BattlePet) {
        let pet2 = battlePet.pet2;
        let aim: BattlePet = this.getAim(battlePet);

        let hitResult: number = 0;
        if (ranWithSeed() < pet2.hitRate - aim.pet2.evdRate) {
            if (ranWithSeed() < pet2.critRate) {
                hitResult = 1 + pet2.critDmgRate * (1 - aim.pet2.dfsRate);
            } else {
                hitResult = 1 * (1 - aim.pet2.dfsRate);
            }
        }

        // 放大招

        // 放技能

        // 普攻
        let atkDmg = pet2.atkDmgFrom + ranWithSeedInt(1 + pet2.atkDmgTo - pet2.atkDmgFrom);
        cc.log(
            'STORM cc ^_^ hit ',
            `攻击${atkDmg} 连击${ComboHitRate[this.realBattle.combo]} 位置${
                FormationHitRate[aim.fromationIdx]
            } 结果${hitResult}`
        );
        atkDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        atkDmg = Math.floor(atkDmg);
        aim.hp -= atkDmg;
        cc.log('STORM cc ^_^ final ', atkDmg, 'hp:', aim.hp);
        if (aim.hp <= 0) aim.hp = 0;

        this.page.doAttack(battlePet.beEnemy, battlePet.idx, this.realBattle.combo);
        this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, atkDmg, hitResult > 1, this.realBattle.combo);
        let logStr = `${petModelDict[battlePet.pet.id].cnName}对${petModelDict[aim.pet.id].cnName}使用普攻`;
        if (this.realBattle.combo > 1) logStr += '连击';
        logStr += `，造成${atkDmg}点伤害`;
        this.page.log(logStr);

        if (aim.hp == 0) this.dead(aim);
    }

    dead(battlePet: BattlePet) {
        this.page.log(`${petModelDict[battlePet.pet.id].cnName}被击败`);

        let rb = this.realBattle;
        let curPets = battlePet.beEnemy ? rb.enemyPets : rb.selfPets;
        let alive = false;
        for (const pet of curPets) {
            if (pet.hp > 0) {
                alive = true;
                break;
            }
        }

        if (alive) {
            let curPetIdx = battlePet.idx;
            for (let index = curPetIdx + 1; index < curPets.length; index++) {
                const pet = curPets[index];
                pet.fromationIdx -= 1;
            }
        } else {
            this.endBattle(battlePet.beEnemy);
        }
    }

    endBattle(selfWin: boolean) {
        this.page.log(selfWin ? '战斗胜利' : '战斗失败');

        let rb = this.realBattle;

        if (selfWin) {
            // 计算获得的exp
            this.receiveExp();
        }

        rb.start = false;
        this.memory.deleteBattle();
        for (let index = 0; index < 5; index++) {
            this.page.clearUIofEnemyPet(index);
        }

        // 清理战斗buff

        this.endCallback();
    }

    receiveExp() {
        let rb = this.realBattle;
        let expRatebyPetCount = ExpRateByPetCount[rb.selfPets.length];
        for (const selfBPet of rb.selfPets) {
            let selfPet = selfBPet.pet;
            if (selfPet.lv >= expModels.length) return;
            let expTotal = 0;
            for (const eBPet of rb.enemyPets) {
                let ePet = eBPet.pet;
                let exp = (ePet.lv * 5 + 45) * (1 + ePet.rank * 0.05);
                exp *= expRatebyPetCount;

                if (selfPet.lv >= ePet.lv) exp *= 1 + (ePet.lv - selfPet.lv) * 0.05;
                else exp *= 1 - Math.min(selfPet.lv - ePet.lv, 8) / 8;

                expTotal += exp;
            }

            expTotal = Math.ceil(expTotal);

            let nextExp = selfPet.exp + expTotal;
            let curExpMax = expModels[selfPet.lv];

            if (nextExp >= curExpMax) {
                selfPet.lv++;
                selfPet.exp = 0;
                this.page.log(`${petModelDict[selfPet.id].cnName}升到了${selfPet.lv}级`);
            } else {
                selfPet.exp = nextExp;
            }
        }
    }

    getAim(battlePet: BattlePet): BattlePet {
        let rb = this.realBattle;
        let petModel = petModelDict[battlePet.pet.id];
        let battleType = battlePet.pet2.exBattleType || petModel.battleType;
        let otherPets = battlePet.beEnemy ? rb.enemyPets : rb.selfPets;
        let aimPets = battlePet.beEnemy ? rb.selfPets : rb.enemyPets;

        let aim: BattlePet = null;
        switch (battleType) {
            case BattleType.melee:
                aim = this.getPetAlive(aimPets[battlePet.idx] || aimPets[aimPets.length - 1]);
                break;
            case BattleType.shoot:
                aim = this.getPetAlive(aimPets[ranWithSeedInt(aimPets.length)]);
                break;
            case BattleType.charge:
                aim = this.getPetAlive(aimPets[0]);
                break;
            case BattleType.assassinate:
                for (const enemyPet of aimPets) {
                    if (enemyPet.hp > 0 && (!aim || enemyPet.hp < aim.hp)) aim = enemyPet;
                }
                break;
            case BattleType.combo:
                if (rb.lastAim && rb.lastAim.beEnemy == aimPets[0].beEnemy) {
                    aim = this.getPetAlive(rb.lastAim);
                } else {
                    aim = this.getPetAlive(aimPets[battlePet.idx] || aimPets[aimPets.length - 1]);
                }
                break;
            case BattleType.chaos:
                {
                    let pets = ranWithSeed() > 0.5 ? aimPets : otherPets;
                    aim = this.getPetAlive(pets[ranWithSeedInt(pets.length)]);
                }
                break;
            default:
                break;
        }
        rb.lastAim = aim;
        return aim;
    }

    getPetAlive(battlePet: BattlePet) {
        let usingNext = true;
        let curPet = battlePet;
        while (true) {
            if (curPet.hp > 0) return curPet;
            if (usingNext) {
                if (curPet.next) curPet = curPet.next;
                else usingNext = false;
            } else {
                curPet = curPet.last;
            }
        }
    }
}
