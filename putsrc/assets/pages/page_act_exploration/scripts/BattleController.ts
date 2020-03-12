/*
 * BattleController.ts
 * 战斗处理类
 * luleyan
 */

import {
    Memory,
    Pet,
    ExplorationModel,
    Pet2,
    BattleType,
    SkillModel,
    SkillType,
    SkillAimtype,
    SkillDirType,
    EleType,
    EleTypeNames,
    FeatureModel
} from 'scripts/Memory';
import PageActExploration from './PageActExploration';

import * as expModels from 'configs/ExpModels';
import actPosModelDict from 'configs/ActPosModelDict';
import * as petModelDict from 'configs/PetModelDict';
import * as skillModelDict from 'configs/SkillModelDict';
import { normalRandom, getRandomOneInList, random, randomRate } from 'scripts/Random';
import BuffModelDict from 'configs/BuffModelDict';

const MagicNum = 1654435769 + Math.floor(Math.random() * 1000000000);
function getCheckedNumber(s: number): number {
    return (s * MagicNum) >> 19;
}

function newInsWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    for (const key in checkIns) {
        if (!checkIns.hasOwnProperty(key)) continue;
        let cNum = checkIns[key];
        if (typeof cNum == 'number') checkIns[key] = getCheckedNumber(cNum) as any;
    }
    return new Proxy(ins, {
        set: function(target, key, value, receiver) {
            if (typeof value == 'number') {
                checkIns[key] = getCheckedNumber(value);
            }
            return Reflect.set(target, key, value, receiver);
        },
        get: function(target, key) {
            let v = target[key];
            if (typeof v == 'number') {
                if (getCheckedNumber(v) != checkIns[key]) {
                    throw new Error('number check wrong!');
                }
            }
            return v;
        }
    });
}

// random with seed -----------------------------------------------------------------

let seed = 5;
let seed2 = 10;
let baseSeed = 5;

function setSeed(s: number) {
    seed = Math.abs(Math.floor(s)) % 199999;
    seed2 = getCheckedNumber(seed);

    baseSeed = seed;
}

function ranWithSeed() {
    if (getCheckedNumber(seed) != seed2) throw new Error('seed check wrong!');
    seed = (seed * 9301 + 49297) % 233280;
    seed2 = getCheckedNumber(seed);
    return seed / 233280.0;
}

function ranWithSeedInt(c: number) {
    return Math.floor(ranWithSeed() * c);
}

// -----------------------------------------------------------------

export class BattleSkill {
    id: string;
    cd: number = 0;
}

export class BattleBuff {
    id: string;
    time: number;
    caster: BattlePet;
    data: any;
}

const ExpRateByPetCount = [0, 1, 0.53, 0.37, 0.29, 0.23];

export class BattlePet {
    idx: number = 0;

    fromationIdx: number = 0;
    beEnemy: boolean = false;

    last: BattlePet = null;
    next: BattlePet = null;

    pet: Pet = null;
    pet2: Pet2 = null;

    hp: number = 0;
    hpMax: number = 0;

    skillDatas: BattleSkill[] = [];

    buffDatas: BattleBuff[] = [];

    init(idx: number, fromationIdx: number, pet: Pet, beEnemy: boolean) {
        this.idx = idx;
        this.fromationIdx = fromationIdx;
        this.pet = pet;
        this.pet2 = newInsWithChecker(Pet2);
        this.pet2.setData(pet);
        this.beEnemy = beEnemy;

        this.hp = this.pet2.hpMax;
        this.hpMax = this.pet2.hpMax;

        // 技能列表
        this.skillDatas.length = 0;
        for (let index = pet.equips.length - 1; index >= 0; index--) {}
        let skillIds = petModelDict[pet.id].selfSkillIds;
        // if (pet.rank >= 8 && skillIds.length >= 2) {
        //     let skill = newInsWithChecker(BattleSkill);
        //     skill.id = skillIds[1];
        //     this.skillDatas.push(skill);
        // }
        // if (pet.rank >= 5 && skillIds.length >= 1){
        //     let skill = newInsWithChecker(BattleSkill);
        //     skill.id = skillIds[0];
        //     this.skillDatas.push(skill);
        // }

        if (skillIds.length >= 2) {
            let skill = newInsWithChecker(BattleSkill);
            skill.id = skillIds[1];
            this.skillDatas.push(skill); // llytest
        }
        if (skillIds.length >= 1) {
            let skill = newInsWithChecker(BattleSkill);
            skill.id = skillIds[0];
            this.skillDatas.push(skill); // llytest
        }
    }

    getAtkDmg() {
        let pet2 = this.pet2;
        return pet2.atkDmgFrom + ranWithSeedInt(1 + pet2.atkDmgTo - pet2.atkDmgFrom);
    }

    getSklDmg() {
        let pet2 = this.pet2;
        return pet2.sklDmgFrom + ranWithSeedInt(1 + pet2.sklDmgTo - pet2.sklDmgFrom);
    }
}

export class BattleTeam {
    pets: BattlePet[] = [];

    mpMax: number = 0;
    mp: number = 0;
    rage: number = 0;
}

export class RealBattle {
    start: boolean = false;

    selfTeam: BattleTeam = null;
    enemyTeam: BattleTeam = null;

    battleRound: number = 0;
    atkRound: number = 0;

    order: BattlePet[] = [];
    curOrderIdx: number = 0;

    lastAim: BattlePet = null;
    combo: number = 1;
}

const ComboHitRate = [0, 1, 1.1, 1.2]; // combo从1开始
const FormationHitRate = [1, 0.95, 0.9, 0.9, 0.85]; // 阵型顺序从0开始
const EleReinforceRelation = [0, 3, 1, 4, 2, 6, 5]; // 元素相克表

export class BattleController {
    page: PageActExploration = null;
    memory: Memory = null;
    endCallback: () => void = null;

    realBattle: RealBattle = null;

    init(page: PageActExploration, memory: Memory, endCallback: () => void) {
        this.page = page;
        this.memory = memory;
        this.endCallback = endCallback;

        this.realBattle = newInsWithChecker(RealBattle);
    }

    resetSelfTeam() {
        this.realBattle.selfTeam = newInsWithChecker(BattleTeam);

        let selfPetsMmr = this.memory.gameData.curExploration.selfs;

        let mpMax = 0;
        let last = null;
        for (let petIdx = 0; petIdx < selfPetsMmr.length; petIdx++) {
            const selfPetMmr = selfPetsMmr[petIdx];

            let pet: Pet;
            for (const petInAll of this.memory.gameData.pets) {
                if (petInAll.catchIdx == selfPetMmr.catchIdx) {
                    pet = petInAll;
                    break;
                }
            }

            let battlePet = newInsWithChecker(BattlePet);
            battlePet.init(petIdx, 5 - selfPetsMmr.length + petIdx, pet, false);
            if (last) {
                battlePet.last = last;
                last.next = battlePet;
            }
            last = battlePet;

            this.realBattle.selfTeam.pets.push(battlePet);

            mpMax += battlePet.pet2.mpMax;

            if (this.realBattle.selfTeam.pets.length == 5) break;
        }

        this.realBattle.selfTeam.mpMax = mpMax;
        this.realBattle.selfTeam.mp = mpMax;

        this.page.setUIofSelfPet(-1);
        this.page.resetCenterBar(mpMax, mpMax, 0);
    }

    checkIfSelfTeamChanged(): boolean {
        let pets = this.memory.gameData.pets;
        let selfPetsMmr = this.memory.gameData.curExploration.selfs;
        for (let petIdx = 0; petIdx < selfPetsMmr.length; petIdx++) {
            const selfPetMmr = selfPetsMmr[petIdx];
            let pet = pets[petIdx];

            if (selfPetMmr.catchIdx != pet.catchIdx) return true;
            if (selfPetMmr.privity != pet.privity) return true;
            if (selfPetMmr.eqpTokens.length != pet.equips.length) return true;
            for (let eqpIdx = 0; eqpIdx < selfPetMmr.eqpTokens.length; eqpIdx++) {
                if (selfPetMmr.eqpTokens[eqpIdx] != pet.equips[eqpIdx].getToken()) return true;
            }
        }
        return false;
    }

    start() {
        let seed = new Date().getTime();
        setSeed(seed);

        // 生成敌人
        let gameData = this.memory.gameData;
        let posId = gameData.curPosId;
        let curPosModel = actPosModelDict[posId];
        let explModel: ExplorationModel = <ExplorationModel>curPosModel.actDict['exploration'];

        let petCount = random(5) + 1;
        let step = gameData.curExploration.curStep;
        let curStepModel = explModel.stepModels[step];

        let enmeyPetType1 = getRandomOneInList(curStepModel.petIds);
        let enmeyPetType2 = getRandomOneInList(curStepModel.petIds);

        let enemyPetDatas = [];
        for (let index = 0; index < petCount; index++) {
            let id = randomRate(0.5) ? enmeyPetType1 : enmeyPetType2;
            let lv = Math.max(1, curPosModel.lv - 2 + normalRandom(5));
            let rank = normalRandom(step * 2) + 1;
            enemyPetDatas.push({ id, lv, rank });
        }

        // 更新battle
        let rb = this.realBattle;
        rb.enemyTeam = newInsWithChecker(BattleTeam);

        let mpMax = 0;
        let last = null;
        for (let index = 0; index < enemyPetDatas.length; index++) {
            const enemyPet = enemyPetDatas[index];

            let petData = newInsWithChecker(Pet);
            petData.catchIdx = index;
            petData.id = enemyPet.id;
            petData.lv = enemyPet.lv;
            petData.rank = enemyPet.rank;

            let battlePet = newInsWithChecker(BattlePet);
            battlePet.init(index, 5 - enemyPetDatas.length + index, petData, true);
            if (last) {
                battlePet.last = last;
                last.next = battlePet;
            }
            last = battlePet;

            mpMax += battlePet.pet2.mpMax;

            rb.enemyTeam.pets.push(battlePet);
        }

        // 按照HP排序
        if (randomRate(1)) {
            let ePets = rb.enemyTeam.pets;
            ePets.sort((a, b) => b.hpMax - a.hpMax);
            // 重置索引
            for (let index = 0; index < ePets.length; index++) {
                const pet = ePets[index];
                pet.idx = index;
                pet.fromationIdx = 5 - ePets.length + index;
            }
        }

        rb.enemyTeam.mp = mpMax;
        rb.enemyTeam.mpMax = mpMax;

        rb.battleRound = 0;
        rb.atkRound = 0;

        rb.order.length = 0;
        for (const pet of rb.selfTeam.pets) rb.order.push(pet);
        for (const pet of rb.enemyTeam.pets) rb.order.push(pet);

        rb.start = true;

        // 更新memory
        this.memory.createBattle(seed);
        for (const { pet } of rb.selfTeam.pets) {
            this.memory.createEnemyPet(pet.id, pet.lv, pet.rank);
        }

        // 更新UI
        this.page.setUIofEnemyPet(-1);

        // 日志
        let petNames = '';
        for (const ePet of this.realBattle.enemyTeam.pets) {
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
        cc.log('STORM cc ^_^ update ---------------------------------------------------', nextOrderIdx);
        if (nextOrderIdx == -1) {
            this.gotoNextRound();
            nextOrderIdx = this.getNextOrderIndex();
            if (nextOrderIdx == -1) {
                cc.error('错误的update，已经没有活着的宠物了');
                return;
            }
        }

        rb.curOrderIdx = nextOrderIdx;
        rb.atkRound++;

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
        cc.log('STORM cc ^_^ end -----------------------------------------------------------');
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

        // 处理cd
        this.handleCD(rb.selfTeam);
        this.handleCD(rb.enemyTeam);

        // 处理buff
        this.handleBuff(rb.selfTeam);
        this.handleBuff(rb.enemyTeam);

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

    handleCD(team: BattleTeam) {
        for (const pet of team.pets) {
            for (const skill of pet.skillDatas) {
                if (skill.cd > 0) skill.cd--;
            }
        }
    }

    handleBuff(team: BattleTeam) {
        for (const pet of team.pets) {
            for (let index = 0; index < pet.buffDatas.length; index++) {
                const buffData = pet.buffDatas[index];
                let buffModel = BuffModelDict[buffData.id];
                if (buffModel.hasOwnProperty('onTurnEnd')) {
                    let buffOutput = buffModel.onTurnEnd(pet, buffData.caster);
                    if (buffOutput) {
                        if (buffOutput.hp) {
                            let dmg = buffOutput.hp;
                            if (dmg > 0) {
                                let eleType = pet.pet2.exEleTypes.getLast() || petModelDict[pet.pet.id].eleType;
                                dmg *= EleReinforceRelation[buffModel.eleType] == eleType ? 1.15 : 1;
                                dmg *= (1 - pet.pet2.dfsRate) * FormationHitRate[pet.fromationIdx];
                            }
                            dmg = Math.floor(dmg);
                            pet.hp -= dmg;
                            if (pet.hp < 1) pet.hp = 1;
                            if (pet.hp > pet.hpMax) pet.hp = pet.hpMax;
                            this.page.doHurt(pet.beEnemy, pet.idx, pet.hp, pet.hpMax, dmg, false, 0);
                        }
                        if (buffOutput.mp || buffOutput.rage) {
                            if (buffOutput.mp) {
                                team.mp -= buffOutput.mp;
                                if (team.mp < 0) team.mp = 0;
                                if (team.mp > team.mpMax) team.mp = team.mpMax;
                            }
                            if (buffOutput.rage) {
                                team.rage -= buffOutput.rage;
                                if (team.rage < 0) team.rage = 0;
                                if (team.rage > 100) team.rage = 100;
                            }
                            if (!pet.beEnemy) this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
                        }
                    }
                }

                buffData.time--;
                if (buffData.time == 0) {
                    buffModel.onEnd(pet, buffData.caster, buffData.data);
                    this.page.removeBuff(pet.beEnemy, pet.idx, buffData.id);
                    pet.buffDatas.splice(index, 1);
                    index--;
                } else {
                    this.page.resetBuffTime(pet.beEnemy, pet.idx, buffData.id, buffData.time);
                }
            }
        }
    }

    attack(battlePet: BattlePet) {
        this.page.doAttack(battlePet.beEnemy, battlePet.idx, this.realBattle.combo);

        do {
            let done: boolean;
            done = this.castUltimateSkill(battlePet);
            if (done) break;

            done = this.castNormalSkill(battlePet);
            if (done) break;

            this.castNormalAttack(battlePet);
        } while (false);
    }

    castUltimateSkill(battlePet: BattlePet): boolean {
        let done = false;
        for (const skillData of battlePet.skillDatas) {
            if (skillData.cd > 0) continue;
            let skillModel: SkillModel = skillModelDict[skillData.id];
            if (skillModel.skillType != SkillType.ultimate) continue;

            let rageNeed = skillModel.rage;
            let team = this.getTeam(battlePet);
            if (team.rage < rageNeed) continue;

            let castSuc = this.cast(battlePet, skillModel);
            if (castSuc) {
                team.rage -= rageNeed;
                skillData.cd = 999;
                if (!battlePet.beEnemy) this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
                done = true;
                break;
            }
        }

        return done;
    }

    castNormalSkill(battlePet: BattlePet): boolean {
        let done = false;
        for (const skillData of battlePet.skillDatas) {
            if (skillData.cd > 0) continue;
            let skillModel: SkillModel = skillModelDict[skillData.id];
            if (skillModel.skillType == SkillType.ultimate) continue;

            let mpNeed = skillModel.mp;
            let team = this.getTeam(battlePet);
            if (team.mp < mpNeed) continue;

            let castSuc = this.cast(battlePet, skillModel);
            if (castSuc) {
                team.mp -= mpNeed;
                skillData.cd = skillModel.cd + 1;
                if (!battlePet.beEnemy) this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
                if (skillModel.skillType == SkillType.normal) done = true; // fast时done为false
                break;
            }
        }

        return done;
    }

    cast(battlePet: BattlePet, skillModel: SkillModel): boolean {
        let aim: BattlePet = this.getAim(battlePet, skillModel.dirType == SkillDirType.self, skillModel.spBattleType);
        if (!aim) return false;

        if (skillModel.hpLimit > 0 && (aim.hp / aim.hpMax) * 100 > skillModel.hpLimit) return false;

        if (skillModel.mainDmg > 0) {
            this.castDmg(battlePet, aim, skillModel.mainDmg, skillModel);
        }
        if (skillModel.mainBuffId && aim.hp > 0) {
            this.castBuff(battlePet, aim, skillModel, true);
        }

        if (skillModel.aimType == SkillAimtype.oneAndNext) {
            let nextAim = aim.next;
            if (skillModel.subDmg > 0 && nextAim.hp > 0) {
                this.castDmg(battlePet, nextAim, skillModel.subDmg, skillModel);
            }
            if (skillModel.subBuffId && nextAim.hp > 0) {
                this.castBuff(battlePet, nextAim, skillModel, false);
            }
        } else if (skillModel.aimType == SkillAimtype.oneAndOthers) {
            let aimPets = this.getTeam(aim).pets;
            for (const aimInAll of aimPets) {
                if (aimInAll == aim || aimInAll.hp == 0) continue;
                if (skillModel.subDmg > 0) this.castDmg(battlePet, aimInAll, skillModel.subDmg, skillModel);
                if (skillModel.subBuffId && aimInAll.hp > 0) {
                    this.castBuff(battlePet, aimInAll, skillModel, false);
                }
            }
        }

        return true;
    }

    getTeam(pet: BattlePet): BattleTeam {
        return pet.beEnemy ? this.realBattle.enemyTeam : this.realBattle.selfTeam;
    }

    castDmg(battlePet: BattlePet, aim: BattlePet, dmgRate: number, skillModel: SkillModel): boolean {
        let finalDmg: number;
        let hitResult = 1;
        if (dmgRate > 0) {
            hitResult = this.getHitResult(battlePet, aim);
            if (hitResult == 0) {
                this.page.doMiss(aim.beEnemy, aim.idx, this.realBattle.combo);
                this.logMiss(battlePet, aim, skillModel.cnName);
                return false;
            }

            finalDmg = Math.max(battlePet.getSklDmg() - aim.pet2.armor, 1) * dmgRate * 0.01;
            finalDmg += Math.max(battlePet.getAtkDmg() - aim.pet2.armor, 1);

            finalDmg *= this.getEleDmgRate(skillModel.eleType, aim);
            finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        } else {
            finalDmg = battlePet.getSklDmg() * dmgRate * 0.01;
        }

        finalDmg = Math.floor(finalDmg);
        aim.hp -= finalDmg;

        if (dmgRate > 0) {
            battlePet.pet.eachFeatures((model: FeatureModel, datas: number[]) => {
                if (model.hasOwnProperty('onAttacking')) {
                    model.onAttacking(battlePet, aim, datas, { ctrlr: this, finalDmg, skillModel });
                }
            });
            aim.pet.eachFeatures((model: FeatureModel, datas: number[]) => {
                if (model.hasOwnProperty('onHurt')) {
                    model.onHurt(aim, battlePet, datas, { ctrlr: this, finalDmg, skillModel });
                }
            });
        } else {
            aim.pet.eachFeatures((model: FeatureModel, datas: number[]) => {
                if (model.hasOwnProperty('onHealed')) {
                    model.onHealed(aim, battlePet, datas, { ctrlr: this, finalDmg, skillModel });
                }
            });
        }

        if (aim.hp < 0) aim.hp = 0;
        if (aim.hp > aim.hpMax) aim.hp = aim.hpMax;

        this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        this.logAtk(battlePet, aim, finalDmg, this.realBattle.combo > 1, skillModel.cnName, skillModel.eleType);

        this.addRageToAim(battlePet, aim);
        if (!aim.beEnemy) {
            let team = this.realBattle.selfTeam;
            this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
        }

        if (aim.hp == 0) {
            this.dead(aim);
            return false;
        } else {
            return true;
        }
    }

    getEleDmgRate(skillEleType: EleType, aim: BattlePet) {
        let eleType = aim.pet2.exEleTypes.getLast() || petModelDict[aim.pet.id].eleType;
        return EleReinforceRelation[skillEleType] == eleType ? 1.15 : 1;
    }

    castBuff(battlePet: BattlePet, aim: BattlePet, skillModel: SkillModel, beMain: boolean) {
        let buffId = beMain ? skillModel.mainBuffId : skillModel.subBuffId;
        let buffTime = beMain ? skillModel.mainBuffTime : skillModel.subBuffTime;
        let buffModel = BuffModelDict[buffId];

        for (let index = 0; index < aim.buffDatas.length; index++) {
            const buffData = aim.buffDatas[index];
            if (buffData.id == buffId) {
                if (buffModel.hasOwnProperty('onEnd')) buffModel.onEnd(aim, buffData.caster, buffData.data);
                aim.buffDatas.splice(index, 1);
                this.page.removeBuff(aim.beEnemy, aim.idx, buffId);
                break;
            }
        }

        let buffData = newInsWithChecker(BattleBuff);
        buffData.id = buffId;
        buffData.time = buffTime;
        buffData.caster = battlePet;
        if (buffModel.hasOwnProperty('onStarted')) buffData.data = buffModel.onStarted(aim, battlePet);
        this.page.addBuff(aim.beEnemy, aim.idx, buffId, buffTime);
        this.logBuff(aim, buffModel.cnName);
        aim.buffDatas.push(buffData);
    }

    castNormalAttack(battlePet: BattlePet) {
        let aim: BattlePet = this.getAim(battlePet, false);
        if (!aim) return;

        let hitResult = this.getHitResult(battlePet, aim);
        if (hitResult == 0) {
            this.page.doMiss(aim.beEnemy, aim.idx, this.realBattle.combo);
            this.logMiss(battlePet, aim, '普攻');
            return;
        }

        let finalDmg = Math.max(battlePet.getAtkDmg() - aim.pet2.armor, 1);
        finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        if (this.realBattle.atkRound > 100) finalDmg *= 1.5; // 时间太长时增加伤害快速结束
        finalDmg = Math.floor(finalDmg);
        aim.hp -= finalDmg;

        battlePet.pet.eachFeatures((model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onAttacked')) {
                model.onAttacking(battlePet, aim, datas, { ctrlr: this, finalDmg, skillModel: null });
            }
        });
        aim.pet.eachFeatures((model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty('onHurt')) {
                model.onHurt(aim, battlePet, datas, { ctrlr: this, finalDmg, skillModel: null });
            }
        });

        if (aim.hp < 0) aim.hp = 0;

        this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        this.logAtk(battlePet, aim, finalDmg, this.realBattle.combo > 1, '普攻');

        this.addRageToAim(battlePet, aim);
        this.addMp(battlePet, aim);
        if (!aim.beEnemy) {
            let team = this.realBattle.selfTeam;
            this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
        }

        if (aim.hp == 0) this.dead(aim);
    }

    addRageToAim(battlePet: BattlePet, aim: BattlePet) {
        let rage = 3 + (aim.pet.lv < battlePet.pet.lv ? 1 : 0) + (aim.pet.rank < battlePet.pet.rank ? 1 : 0);

        let team = this.getTeam(aim);
        team.rage += rage;
        if (team.rage > 100) team.rage = 100;
    }

    addMp(battlePet: BattlePet, aim: BattlePet) {
        let mp = 5 + (aim.pet.lv > battlePet.pet.lv ? 1 : 0) + (aim.pet.rank > battlePet.pet.rank ? 1 : 0);

        let team = this.getTeam(battlePet);
        team.mp += mp;
        if (team.mp > team.mpMax) team.mp = team.mpMax;
    }

    dead(battlePet: BattlePet) {
        this.page.log(`${petModelDict[battlePet.pet.id].cnName}被击败`);

        let curPets = this.getTeam(battlePet).pets;
        let alive = false;
        for (const pet of curPets) {
            if (pet.hp > 0) {
                alive = true;
                break;
            }
        }

        if (alive) {
            battlePet.buffDatas.length = 0;
            this.page.removeBuff(battlePet.beEnemy, battlePet.idx, null);

            for (let index = battlePet.idx + 1; index < curPets.length; index++) {
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

        // 清理敌人状态
        for (let index = 0; index < 5; index++) {
            this.page.clearUIofEnemyPet(index);
            this.page.removeBuff(true, index, null);
        }

        // 清理己方状态
        for (const selfPet of rb.selfTeam.pets) {
            selfPet.buffDatas.length = 0;
            this.page.removeBuff(selfPet.beEnemy, selfPet.idx, null);
        }

        this.endCallback();
    }

    receiveExp() {
        let rb = this.realBattle;
        let expRatebyPetCount = ExpRateByPetCount[rb.selfTeam.pets.length];
        for (const selfBPet of rb.selfTeam.pets) {
            let selfPet = selfBPet.pet;
            if (selfPet.lv >= expModels.length) return;
            let expTotal = 0;
            for (const eBPet of rb.enemyTeam.pets) {
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

    getAim(battlePet: BattlePet, toSelf: boolean, spBattleType: BattleType = null): BattlePet {
        let rb = this.realBattle;
        let battleType = spBattleType || this.getBattleType(battlePet);

        let aimPets;
        let anotherSidePets;
        if (toSelf) {
            aimPets = battlePet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
            anotherSidePets = battlePet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
        } else {
            aimPets = battlePet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
            anotherSidePets = battlePet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
        }

        let aim: BattlePet = null;
        switch (battleType) {
            case BattleType.melee:
                aim = this.getPetAlive(aimPets[battlePet.idx] || aimPets.getLast());
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
                    let pets = ranWithSeed() > 0.5 ? aimPets : anotherSidePets;
                    aim = this.getPetAlive(pets[ranWithSeedInt(pets.length)]);
                }
                break;
            default:
                break;
        }
        rb.lastAim = aim;
        return aim;
    }

    getBattleType(battlePet: BattlePet) {
        return battlePet.pet2.exBattleTypes.getLast() || petModelDict[battlePet.pet.id].battleType;
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

    getHitResult(battlePet: BattlePet, aim: BattlePet): number {
        let hitResult: number = 0;
        let pet2 = battlePet.pet2;
        let hitRate = pet2.hitRate;
        let agiProportion = pet2.agility / aim.pet2.agility;
        if (agiProportion > 1) hitRate = hitRate + 0.02 + (agiProportion - 1) * 0.1;
        else if (agiProportion < 1) hitRate = hitRate - (1 - agiProportion) * 0.1;

        if (ranWithSeed() < hitRate - aim.pet2.evdRate) {
            if (ranWithSeed() < pet2.critRate) {
                hitResult = 1 + pet2.critDmgRate * (1 - aim.pet2.dfsRate);
            } else {
                hitResult = 1 * (1 - aim.pet2.dfsRate);
            }
        }

        return hitResult;
    }

    logAtk(battlePet: BattlePet, aim: BattlePet, dmg: number, beCombo: boolean, skillName: string, eleType: EleType = null) {
        let logStr = `${petModelDict[battlePet.pet.id].cnName}对${petModelDict[aim.pet.id].cnName}使用${skillName}`;
        if (dmg > 0) {
            if (beCombo) logStr += '连击';
            logStr += `，造成${Math.floor(dmg * 0.1)}点${eleType ? EleTypeNames[eleType] : '物理'}伤害`;
        } else {
            logStr += `，恢复血量${Math.floor(dmg * -0.1)}点`;
        }

        this.page.log(logStr);
    }

    logMiss(battlePet: BattlePet, aim: BattlePet, skillName: string) {
        let logStr = `${petModelDict[aim.pet.id].cnName}避开了${petModelDict[battlePet.pet.id].cnName}的${skillName}`;
        this.page.log(logStr);
    }

    logBuff(aim: BattlePet, name: string) {
        let logStr = `${petModelDict[aim.pet.id].cnName}受到${name}效果`;
        this.page.log(logStr);
    }
}
