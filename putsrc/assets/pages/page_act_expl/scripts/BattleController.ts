/*
 * BattleController.ts
 * 战斗处理类
 * luleyan
 */

import {
    Memory,
    Pet,
    ExplModel,
    Pet2,
    BattleType,
    SkillModel,
    SkillType,
    SkillAimtype,
    SkillDirType,
    EleType,
    EleTypeNames,
    FeatureModel,
    Feature,
    BattleDataForFeature
} from 'scripts/Memory';
import PageActExpl from './PageActExpl';
import { normalRandom, getRandomOneInList, random, randomRate } from 'scripts/Random';

import * as expModels from 'configs/ExpModels';
import actPosModelDict from 'configs/ActPosModelDict';
import * as petModelDict from 'configs/PetModelDict';
import * as skillModelDict from 'configs/SkillModelDict';
import * as inbornFeatures from 'configs/InbornFeatures';
import BuffModelDict from 'configs/BuffModelDict';

import { deepCopy } from 'scripts/Utils';

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
        set: function (target, key, value, receiver) {
            if (typeof value == 'number') {
                checkIns[key] = getCheckedNumber(value);
            }
            return Reflect.set(target, key, value, receiver);
        },
        get: function (target, key) {
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

function getCurSeed(): number {
    return seed;
}

// -----------------------------------------------------------------

export class BattleSkill {
    id: string;
    cd: number = 0;
    mpUsing: number = 0;
}

export class BattleBuff {
    id: string;
    time: number;
    caster: BattlePet;
    data: any;
}

const ExpRateByPetCount = [0, 1, 0.53, 0.37, 0.29, 0.23];

type StartingBattleFeature = {
    func: (pet: BattlePet, datas: number[], ctrlr: BattleController) => void;
    datas: number[];
    id: string;
};
type AttackingFeature = {
    func: (pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
};
type CastingFeature = {
    func: (pet: BattlePet, aim: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
};
type HurtFeature = {
    func: (pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
};
type HealedFeature = {
    func: (pet: BattlePet, caster: BattlePet, datas: number[], bData: BattleDataForFeature) => void;
    datas: number[];
    id: string;
};
type EnemyDeadFeature = {
    func: (pet: BattlePet, aim: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController) => void;
    datas: number[];
    id: string;
};
type DeadFeature = {
    func: (pet: BattlePet, caster: BattlePet, datas: number[], ctrlr: BattleController) => void;
    datas: number[];
    id: string;
};

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

    startingBattleFeatures: StartingBattleFeature[] = [];
    attackingFeatures: AttackingFeature[] = [];
    castingFeatures: CastingFeature[] = [];
    hurtFeatures: HurtFeature[] = [];
    healedFeatures: HealedFeature[] = [];
    enemyDeadFeatures: EnemyDeadFeature[] = [];
    deadFeatures: DeadFeature[] = [];

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

        let getMpUsing = (skillId: string) => {
            let skillModel: SkillModel = skillModelDict[skillId];
            let mpUsing = skillModel.mp;
            if (petModelDict[pet.id].eleType == skillModel.eleType) mpUsing -= Math.floor(mpUsing * 0.1);
            return mpUsing;
        };

        // 特性
        this.startingBattleFeatures.length = 0;
        this.attackingFeatures.length = 0;
        this.castingFeatures.length = 0;
        this.hurtFeatures.length = 0;
        this.healedFeatures.length = 0;
        this.enemyDeadFeatures.length = 0;
        this.deadFeatures.length = 0;

        let addFeatureFunc = (attri: string, funcName: string, model: FeatureModel, datas: number[]) => {
            if (model.hasOwnProperty(funcName)) {
                let list: { func: any; datas: number[]; id: string }[] = this[attri];
                for (const featureInList of list) {
                    if (featureInList.id == model.id) {
                        for (let index = 0; index < featureInList.datas.length; index++) {
                            featureInList.datas[index] += datas[index];
                        }
                        return;
                    }
                }
                list.push({ func: model[funcName], datas, id: model.id });
            }
        };

        pet.eachFeatures((model: FeatureModel, datas: number[]) => {
            addFeatureFunc('startingBattleFeatures', 'onStartingBattle', model, datas);
            addFeatureFunc('attackingFeatures', 'onAttacking', model, datas);
            addFeatureFunc('castingFeatures', 'onCasting', model, datas);
            addFeatureFunc('hurtFeatures', 'onHurt', model, datas);
            addFeatureFunc('healedFeatures', 'onHealed', model, datas);
            addFeatureFunc('enemyDeadFeatures', 'onEnemyDead', model, datas);
            addFeatureFunc('deadFeatures', 'onDead', model, datas);
        });

        // 装备技能

        // 自带技能
        this.skillDatas.length = 0;
        for (let index = pet.equips.length - 1; index >= 0; index--) {}
        let skillIds = petModelDict[pet.id].selfSkillIds;
        // if (pet.rank >= 8 && skillIds.length >= 2) {
        //     let skill = newInsWithChecker(BattleSkill);
        //     skill.id = skillIds[1];
        //     skill.mpUsing = getMpUsing(skill.id);
        //     this.skillDatas.push(skill);
        // }
        // if (pet.rank >= 5 && skillIds.length >= 1) {
        //     let skill = newInsWithChecker(BattleSkill);
        //     skill.id = skillIds[0];
        //     skill.mpUsing = getMpUsing(skill.id);
        //     this.skillDatas.push(skill);
        // }

        if (skillIds.length >= 2) {
            let skill = newInsWithChecker(BattleSkill);
            skill.id = skillIds[1];
            skill.mpUsing = getMpUsing(skill.id);
            this.skillDatas.push(skill); // llytest
        }
        if (skillIds.length >= 1) {
            let skill = newInsWithChecker(BattleSkill);
            skill.id = skillIds[0];
            skill.mpUsing = getMpUsing(skill.id);
            this.skillDatas.push(skill); // llytest
        }
    }

    getAtkDmg(aim: BattlePet) {
        let pet2 = this.pet2;
        let dmg = pet2.atkDmgFrom + ranWithSeedInt(1 + pet2.atkDmgTo - pet2.atkDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    getSklDmg(aim: BattlePet) {
        let pet2 = this.pet2;
        let dmg = pet2.sklDmgFrom + ranWithSeedInt(1 + pet2.sklDmgTo - pet2.sklDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    clone() {
        let newBPet = new BattlePet();
        newBPet.idx = this.idx;
        newBPet.fromationIdx = this.fromationIdx;
        newBPet.beEnemy = this.beEnemy;

        newBPet.last = this.last; // 暂时指向旧数据，在RealBattle的clone中更新
        newBPet.next = this.next; // 暂时指向旧数据，在RealBattle的clone中更新

        newBPet.pet = this.pet;
        newBPet.pet2 = this.pet2;

        newBPet.hp = this.hp;
        newBPet.hpMax = this.hpMax;

        for (const skill of this.skillDatas) {
            let newSkill = new BattleSkill();
            newSkill.cd = skill.cd;
            newSkill.id = skill.id;
            newBPet.skillDatas.push(newSkill);
        }

        for (const buff of this.buffDatas) {
            let newBuff = new BattleBuff();
            newBuff.id = buff.id;
            newBuff.caster = buff.caster;
            newBuff.time = buff.time;
            newBuff.data = buff.data;
            newBPet.buffDatas.push(newBuff);
        }

        return newBPet;
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

    clone() {
        let newRB = new RealBattle();
        newRB.start = this.start;
        newRB.selfTeam = <BattleTeam>deepCopy(this.selfTeam);
        newRB.enemyTeam = <BattleTeam>deepCopy(this.enemyTeam);
        newRB.battleRound = this.battleRound;
        newRB.atkRound = this.atkRound;
        newRB.curOrderIdx = this.curOrderIdx;
        newRB.combo = this.combo;

        for (const bPet of this.order) {
            newRB.order.push(this.copyAim(bPet, newRB));
        }
        newRB.lastAim = this.copyAim(this.lastAim, newRB);

        for (const pet of newRB.selfTeam.pets) {
            pet.last = this.copyAim(pet.last, newRB);
            pet.next = this.copyAim(pet.next, newRB);
        }

        for (const pet of newRB.enemyTeam.pets) {
            pet.last = this.copyAim(pet.last, newRB);
            pet.next = this.copyAim(pet.next, newRB);
        }

        return newRB;
    }

    copyAim(aim: BattlePet, to: RealBattle) {
        if (!aim) return null;
        let team = aim.beEnemy ? to.enemyTeam : to.selfTeam;
        return team.pets[aim.idx];
    }
}

const ComboHitRate = [0, 1, 1.1, 1.2]; // combo从1开始
const FormationHitRate = [1, 0.95, 0.9, 0.9, 0.85]; // 阵型顺序从0开始
const EleReinforceRelation = [0, 3, 1, 4, 2, 6, 5]; // 元素相克表

export class BattleController {
    page: PageActExpl = null;
    memory: Memory = null;
    endCallback: () => void = null;

    realBattle: RealBattle = null;

    debugMode: boolean = false;
    realBattleCopys: { seed: number; rb: RealBattle }[] = []; // 用于战斗重置

    init(page: PageActExpl, memory: Memory, endCallback: () => void) {
        this.page = page;
        this.memory = memory;
        this.endCallback = endCallback;

        this.realBattle = newInsWithChecker(RealBattle);

        // 快捷键
        this.page.ctrlr.debugTool.setShortCut('rr', () => {
            if (!this.realBattle.start) {
                cc.log('PUT 没有战斗');
                return;
            }
            cc.log('PUT 重新开始当前战斗');
            this.resetBattleDataToBegin();
        });

        this.page.ctrlr.debugTool.setShortCut('bb', () => {
            if (!this.realBattle.start) {
                cc.log('PUT 没有战斗');
                return;
            }
            cc.log('PUT 回到上次回合开始');
            this.resetBattleDataToTurnBegin();
        });

        if (CC_DEBUG) this.debugMode = true;

        // @ts-ignore
        if (this.debugMode) window.battleCtrlr = this; // 便于测试
    }

    resetBattleDataToBegin() {
        this.realBattle = <RealBattle>deepCopy(this.realBattleCopys[0].rb);
        setSeed(this.realBattleCopys[0].seed);
        this.realBattleCopys.length = 1;
        this.resetAllUI();
        this.gotoNextRound();
    }

    resetBattleDataToTurnBegin() {
        if (this.realBattleCopys.length <= 1) {
            this.resetBattleDataToBegin();
        } else {
            let last = this.realBattleCopys.pop();
            this.realBattle = <RealBattle>deepCopy(last.rb);
            setSeed(last.seed);
            this.resetAllUI();
        }
    }

    resetAllUI() {
        this.page.setUIofSelfPet(-1);
        this.page.setUIofEnemyPet(-1);
        let team = this.realBattle.selfTeam;
        this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
        for (const pet of team.pets) {
            this.page.removeBuff(pet.beEnemy, pet.idx, null);
            for (const { id, time } of pet.buffDatas) this.page.addBuff(pet.beEnemy, pet.idx, id, time);
        }
        for (const pet of this.realBattle.enemyTeam.pets) {
            this.page.removeBuff(pet.beEnemy, pet.idx, null);
            for (const { id, time } of pet.buffDatas) this.page.addBuff(pet.beEnemy, pet.idx, id, time);
        }
    }

    destroy() {
        this.page.ctrlr.debugTool.removeShortCut('rr');
        this.page.ctrlr.debugTool.removeShortCut('bb');
    }

    resetSelfTeam() {
        this.realBattle.selfTeam = newInsWithChecker(BattleTeam);

        let selfPetsMmr = this.memory.gameData.curExpl.selfs;
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
        let selfPetsMmr = this.memory.gameData.curExpl.selfs;
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

        // 更新battle
        this.resetRealBattle();
        let rb = this.realBattle;

        if (this.debugMode) {
            this.realBattleCopys.length = 0;
            this.realBattleCopys.push({ seed: getCurSeed(), rb: <RealBattle>deepCopy(rb) });
        }

        // 更新memory
        this.memory.createBattle(
            seed,
            rb.enemyTeam.pets.map<Pet>(
                (value: BattlePet): Pet => {
                    return value.pet;
                }
            )
        );

        // 更新UI
        this.page.setUIofEnemyPet(-1);

        // 日志
        let hiding = this.memory.gameData.curExpl.hiding;
        let petNameDict = {};
        for (const ePet of this.realBattle.enemyTeam.pets) {
            let petId = ePet.pet.id;
            let cnName = petModelDict[petId].cnName;
            petNameDict[cnName] = true;
        }
        let petNames = Object.keys(petNameDict);
        this.page.log((hiding ? '伏击：' : '进入战斗：') + petNames.join(', '));

        // 偷袭
        if (hiding) {
            for (let index = 0; index < 5; index++) {
                if (index >= rb.selfTeam.pets.length || index >= rb.enemyTeam.pets.length) break;
                let selfPet = rb.selfTeam.pets[index];
                let enemyPet = rb.enemyTeam.pets[index];

                let agiRate = selfPet.pet2.agility / enemyPet.pet2.agility;
                let times = Math.ceil(agiRate); // 敏捷每大于敌人100%，会让敌人多静止1回合
                this.addBuff(enemyPet, selfPet, 'JingZhi', times);
            }
        }

        // 触发进入战斗特性
        for (const pet of rb.order) {
            pet.startingBattleFeatures.forEach((value: StartingBattleFeature) => {
                value.func(pet, value.datas, this);
            });
        }

        this.gotoNextRound();
    }

    resetRealBattle() {
        let enemyPetDatas = this.createEnemyData();

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
            petData.inbornFeatures = enemyPet.features;

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
    }

    createEnemyData(): { id: string; lv: number; rank: number; features: Feature[] }[] {
        let gameData = this.memory.gameData;
        let posId = gameData.curPosId;
        let curPosModel = actPosModelDict[posId];
        let explModel: ExplModel = <ExplModel>curPosModel.actDict['exploration'];

        let petCountMax = curPosModel.lv < 10 ? 4 : 5;
        let petCount = random(petCountMax) + 1;
        let step = gameData.curExpl.curStep;
        let curStepModel = explModel.stepModels[step];

        let enmeyPetType1 = getRandomOneInList(curStepModel.petIds);
        let enmeyPetType2 = getRandomOneInList(curStepModel.petIds);

        let enemyPetDatas: { id: string; lv: number; rank: number; features: Feature[] }[] = [];
        for (let index = 0; index < petCount; index++) {
            let id = randomRate(0.5) ? enmeyPetType1 : enmeyPetType2;
            let lv = Math.max(1, curPosModel.lv - 2 + normalRandom(5));
            let rank = normalRandom(step * 2) + 1;
            let features = [];

            let featureR = Math.random();
            if (featureR > 0.3) features.push(this.createInbornFeature());
            if (featureR > 0.8) features.push(this.createInbornFeature());

            enemyPetDatas.push({ id, lv, rank, features });
        }
        return enemyPetDatas;
    }

    createInbornFeature(): Feature {
        let feature = new Feature();
        feature.id = getRandomOneInList(inbornFeatures);
        feature.setDatas(1 + Math.floor(Math.pow(Math.random(), 3) * 10)); // 使用3次方，使随机结果更小
        return feature;
    }

    update() {
        let rb = this.realBattle;

        let nextOrderIdx = this.getNextOrderIndex();
        cc.log('STORM cc ^_^ update ---------------------------------------------------', nextOrderIdx);
        if (nextOrderIdx == -1) {
            if (this.debugMode) {
                this.realBattleCopys.push({ seed: getCurSeed(), rb: <RealBattle>deepCopy(rb) });
            }

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
            let suc = this.attack(nextPet);
            if (!suc) rb.combo--; // 未成功攻击则不算连击
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
            return b.pet2.speed - a.pet2.speed;
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
                buffData.time--;

                let buffModel = BuffModelDict[buffData.id];
                if (buffModel.hasOwnProperty('onTurnEnd')) {
                    let buffOutput = buffModel.onTurnEnd(pet, buffData);
                    if (buffOutput) {
                        if (buffOutput.hp) {
                            let dmg = buffOutput.hp;
                            if (dmg > 0) {
                                dmg *= this.getEleDmgRate(buffModel.eleType, pet, buffData.caster);
                                dmg *= (1 - pet.pet2.dfsRate) * FormationHitRate[pet.fromationIdx];
                            }
                            dmg = Math.floor(dmg);
                            pet.hp -= dmg;
                            if (pet.hp < 1) pet.hp = 1;
                            else if (pet.hp > pet.hpMax) pet.hp = pet.hpMax;
                            this.page.doHurt(pet.beEnemy, pet.idx, pet.hp, pet.hpMax, dmg, false, 0);
                        }
                        if (buffOutput.mp || buffOutput.rage) {
                            if (buffOutput.mp) {
                                team.mp -= buffOutput.mp;
                                if (team.mp < 0) team.mp = 0;
                                else if (team.mp > team.mpMax) team.mp = team.mpMax;
                            }
                            if (buffOutput.rage) {
                                team.rage -= buffOutput.rage;
                                if (team.rage < 0) team.rage = 0;
                                else if (team.rage > 100) team.rage = 100;
                            }
                            if (!pet.beEnemy) this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
                        }
                    }
                }

                if (buffData.time == 0) {
                    if (buffModel.hasOwnProperty('onEnd')) buffModel.onEnd(pet, buffData.caster, buffData.data);
                    this.page.removeBuff(pet.beEnemy, pet.idx, buffData.id);
                    pet.buffDatas.splice(index, 1);
                    index--;
                } else {
                    this.page.resetBuffTime(pet.beEnemy, pet.idx, buffData.id, buffData.time);
                }
            }
        }
    }

    attack(battlePet: BattlePet): boolean {
        do {
            let done: boolean;
            done = this.castUltimateSkill(battlePet);
            if (done) break;

            done = this.castNormalSkill(battlePet);
            if (done) break;

            done = this.castNormalAttack(battlePet);
            if (done) break;

            this.logStop(battlePet);
            return false; // 未成功攻击
        } while (false);

        this.page.doAttack(battlePet.beEnemy, battlePet.idx, this.realBattle.combo);
        return true; // 成功进行攻击
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

            let mpNeed = skillData.mpUsing;
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

            finalDmg = battlePet.getSklDmg(aim) * dmgRate * 0.01;
            finalDmg += battlePet.getAtkDmg(aim);

            finalDmg *= this.getEleDmgRate(skillModel.eleType, aim, battlePet);
            finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        } else {
            finalDmg = battlePet.getSklDmg(aim) * dmgRate * 0.01;
        }

        finalDmg = Math.floor(finalDmg);

        let lastHp = aim.hp;
        aim.hp -= finalDmg;

        if (dmgRate > 0) {
            battlePet.castingFeatures.forEach((value: AttackingFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            battlePet.hurtFeatures.forEach((value: HurtFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            if (aim.hp < 0) aim.hp = 0;
            else if (aim.hp > lastHp - 1) aim.hp = lastHp - 1;
        } else {
            battlePet.healedFeatures.forEach((value: HealedFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            if (aim.hp > aim.hpMax) aim.hp = aim.hpMax;
        }

        finalDmg = lastHp - aim.hp;

        this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        this.logAtk(battlePet, aim, finalDmg, this.realBattle.combo > 1, skillModel.cnName, skillModel.eleType);

        this.addRageToAim(battlePet, aim);
        if (!aim.beEnemy) {
            let team = this.realBattle.selfTeam;
            this.page.resetCenterBar(team.mp, team.mpMax, team.rage);
        }

        if (aim.hp == 0) {
            this.dead(aim, battlePet);
            return false;
        } else {
            return true;
        }
    }

    getEleDmgRate(skillEleType: EleType, aim: BattlePet, caster: BattlePet) {
        let eleType = aim.pet2.exEleTypes.getLast() || petModelDict[aim.pet.id].eleType;
        let dmgGain = caster && petModelDict[caster.pet.id].eleType == skillEleType ? 1.05 : 1;
        let dmgRestricts = EleReinforceRelation[skillEleType] == eleType ? 1.15 : 1;
        return dmgGain * dmgRestricts;
    }

    castBuff(battlePet: BattlePet, aim: BattlePet, skillModel: SkillModel, beMain: boolean) {
        let buffId = beMain ? skillModel.mainBuffId : skillModel.subBuffId;
        let buffTime = beMain ? skillModel.mainBuffTime : skillModel.subBuffTime;
        this.addBuff(aim, battlePet, buffId, buffTime);
    }

    addBuff(aim: BattlePet, caster: BattlePet, buffId: string, buffTime: number) {
        let buffModel = BuffModelDict[buffId];
        for (let index = 0; index < aim.buffDatas.length; index++) {
            const buffData = aim.buffDatas[index];
            if (buffData.id == buffId) {
                if (buffTime > buffData.time) buffData.time = buffTime;
                return;
            }
        }

        let buffData = newInsWithChecker(BattleBuff);
        buffData.id = buffId;
        buffData.time = buffTime;
        buffData.caster = caster;
        if (buffModel.hasOwnProperty('onStarted')) buffData.data = buffModel.onStarted(aim, caster);
        this.page.addBuff(aim.beEnemy, aim.idx, buffId, buffTime);
        this.logBuff(aim, buffModel.cnName);
        aim.buffDatas.push(buffData);
    }

    castNormalAttack(battlePet: BattlePet): boolean {
        let aim: BattlePet = this.getAim(battlePet, false);
        if (!aim) return false;

        let hitResult = this.getHitResult(battlePet, aim);
        if (hitResult == 0) {
            this.page.doMiss(aim.beEnemy, aim.idx, this.realBattle.combo);
            this.logMiss(battlePet, aim, '普攻');
            return true;
        }

        let finalDmg = battlePet.getAtkDmg(aim);
        finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        if (this.realBattle.atkRound > 100) finalDmg *= 1.5; // 时间太长时增加伤害快速结束
        finalDmg = Math.floor(finalDmg);
        aim.hp -= finalDmg;

        battlePet.attackingFeatures.forEach((value: AttackingFeature) => {
            value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel: null });
        });
        battlePet.hurtFeatures.forEach((value: HurtFeature) => {
            value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel: null });
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

        if (aim.hp == 0) this.dead(aim, battlePet);

        return true;
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

    dead(battlePet: BattlePet, caster: BattlePet) {
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
            battlePet.deadFeatures.forEach((value: DeadFeature) => {
                value.func(battlePet, caster, value.datas, this);
            });
            let petsAlive = this.getTeam(caster).pets.filter((value: BattlePet) => value.hp > 0);
            for (const petAlive of petsAlive) {
                battlePet.enemyDeadFeatures.forEach((value: EnemyDeadFeature) => {
                    value.func(petAlive, battlePet, caster, value.datas, this);
                });
            }

            battlePet.buffDatas.length = 0;
            this.page.removeBuff(battlePet.beEnemy, battlePet.idx, null);

            if (battlePet.beEnemy && battlePet.idx == this.memory.gameData.curExpl.curBattle.catchPetIdx) {
                this.addCatchBuff(battlePet.idx);
            }

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
        this.exitBattle(selfWin);
    }

    escape() {
        this.page.log('撤退');
        this.exitBattle(false);
    }

    exitBattle(selfWin: boolean) {
        let rb = this.realBattle;

        if (selfWin) {
            this.receiveExp(); // 计算获得的exp
            this.executePetCatch();
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

    executePetCatch() {
        let gameData = this.memory.gameData;
        let catchIdx = gameData.curExpl.curBattle.catchPetIdx;
        if (catchIdx == -1) return;

        let battlePet = this.realBattle.enemyTeam.pets[catchIdx];

        // 计算空间是否允许
        let gameData2 = this.memory.gameData2;
        if (gameData.pets.length >= gameData2.petLenMax) return;

        // 计算是否成功捕捉
        let pet = battlePet.pet;
        let curLvCatcherHaving = false; // llytodo
        let highLvCatcherHaving = false;
        let suc = false;

        if (curLvCatcherHaving) {
            suc = 1 - ((pet.lv - 1) % 10) * 0.04 > ranWithSeed();
        } else if (highLvCatcherHaving) {
            suc = true;
        } else {
            suc = Math.max(1 - (pet.lv - 5) * 0.05, 0.1) > ranWithSeed();
        }

        if (suc) {
            this.page.log(`成功捕获${petModelDict[pet.id].cnName}`);
            this.memory.addPet(pet.id, pet.lv, pet.rank, pet.inbornFeatures);
        } else {
            this.page.log(`捕获${petModelDict[pet.id].cnName}失败`);
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
                let pets = ranWithSeed() > 0.5 ? aimPets : anotherSidePets;
                aim = this.getPetAlive(pets[ranWithSeedInt(pets.length)]);
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

    logStop(battlePet: BattlePet) {
        let logStr = `${petModelDict[battlePet.pet.id].cnName}无法行动`;
        this.page.log(logStr);
    }

    setCatchPetIndex(battleId: number, index: number) {
        if (!this.realBattle.start) return;

        let curBattleId = this.memory.gameData.curExpl.curBattle.startTime;
        if (curBattleId != battleId) return;

        let curCatchPetIdx = this.memory.gameData.curExpl.curBattle.catchPetIdx;
        if (index == curCatchPetIdx) return;

        if (curCatchPetIdx >= 0) this.page.removeBuffByStr(true, curCatchPetIdx, '捕');
        this.memory.gameData.curExpl.curBattle.catchPetIdx = index;
        this.addCatchBuff(index);
        this.page.setCatchActive(true);
    }

    addCatchBuff(index: number) {
        this.page.addBuffByStr(true, index, '捕', cc.color(63, 180, 170));
    }

    random() {
        return ranWithSeed();
    }
}
