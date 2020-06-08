/*
 * BattleController.ts
 * 战斗处理类
 * luleyan
 */

import { Memory, EquipDataTool, GameDataTool, PetDataTool } from 'scripts/Memory';
import BattlePageBase from './BattlePageBase';
import { normalRandom, getRandomOneInList, random, randomRate } from 'scripts/Random';

import { expModels } from 'configs/ExpModels';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { skillModelDict } from 'configs/SkillModelDict';
import { inbornFeatures } from 'configs/InbornFeatures';
import { buffModelDict } from 'configs/BuffModelDict';
import { petModelDict } from 'configs/PetModelDict';

import { deepCopy } from 'scripts/Utils';
import { SkillModel, SkillType, ExplModel, SkillAimtype, SkillDirType, BuffOutput } from 'scripts/DataModel';
import { Pet, Feature, EleType, BattleType, EleTypeNames, GameData } from 'scripts/DataSaved';
import { RealBattle, BattleTeam, BattlePet, BattleBuff, RAGE_MAX, AmplAttriType } from 'scripts/DataOther';

// random with seed -----------------------------------------------------------------

let seed = 5;
let seed2 = 10;
let baseSeed = 5;

function setSeed(s: number) {
    seed = Math.abs(Math.floor(s)) % 199999;
    seed2 = seed;

    baseSeed = seed;
}

function ranWithSeed() {
    if (seed != seed2) throw new Error('seed check wrong!');
    seed = (seed * 9301 + 49297) % 233280;
    seed2 = seed;
    return seed / 233280.0;
}

function ranWithSeedInt(c: number) {
    return Math.floor(ranWithSeed() * c);
}

function getCurSeed(): number {
    return seed;
}

// -----------------------------------------------------------------

const ExpRateByPetCount = [0, 1, 0.53, 0.37, 0.29, 0.23];

const ComboHitRate = [0, 1, 1.1, 1.2]; // combo从1开始
const FormationHitRate = [1, 0.95, 0.9, 0.9, 0.85]; // 阵型顺序从0开始
const EleReinforceRelation = [0, 3, 1, 4, 2, 6, 5]; // 元素相克表

const CatchRatebyRank = [1, 0.9, 0.6, 0.5, 0.3, 0.1, 0, -0.2, -1, -2, -10];

type EnemyPetData = { id: string; lv: number; rank: number; features: Feature[] };

export class BattleController {
    page: BattlePageBase = null;
    memory: Memory = null;
    gameData: GameData = null;
    endCallback: () => void = null;

    realBattle: RealBattle = null;

    debugMode: boolean = false;
    realBattleCopys: { seed: number; rb: RealBattle }[] = []; // 用于战斗重置

    init(page: BattlePageBase, memory: Memory, endCallback: () => void) {
        this.page = page;
        this.memory = memory;
        this.gameData = memory.gameData;
        this.endCallback = endCallback;

        this.realBattle = new RealBattle();

        // 快捷键
        this.page.ctrlr.debugTool.setShortCut('rr', this.resetBattleDataToBegin.bind(this));
        this.page.ctrlr.debugTool.setShortCut('bb', this.resetBattleDataToTurnBegin.bind(this));

        if (CC_DEBUG) this.debugMode = true;

        // @ts-ignore
        if (this.debugMode) window.battleCtrlr = this; // 便于测试
    }

    resetBattleDataToBegin() {
        if (!this.realBattle.start) {
            cc.log('PUT 没有战斗');
            return;
        }
        cc.log('PUT 重新开始当前战斗');

        this.realBattle = <RealBattle>deepCopy(this.realBattleCopys[0].rb);
        setSeed(this.realBattleCopys[0].seed);
        this.realBattleCopys.length = 1;
        this.resetAllUI();
        this.gotoNextRound();
    }

    resetBattleDataToTurnBegin() {
        if (!this.realBattle.start) {
            cc.log('PUT 没有战斗');
            return;
        }
        cc.log('PUT 回到上次回合开始');

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
        this.page.resetAttriBar(team.mp, team.mpMax, team.rage);
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
        this.realBattle.selfTeam = new BattleTeam();

        let selfPetsMmr = this.gameData.curExpl.selfs;
        let mpMax = 0;
        let last = null;
        for (let petIdx = 0; petIdx < selfPetsMmr.length; petIdx++) {
            const selfPetMmr = selfPetsMmr[petIdx];

            let pet: Pet;
            for (const petInAll of this.gameData.pets) {
                if (petInAll.catchIdx == selfPetMmr.catchIdx) {
                    pet = petInAll;
                    break;
                }
            }

            let battlePet = new BattlePet();
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
        this.page.resetAttriBar(mpMax, mpMax, 0);
    }

    checkIfSelfTeamChanged(): boolean {
        let pets = this.gameData.pets;
        let selfPetsMmr = this.gameData.curExpl.selfs;
        for (let petIdx = 0; petIdx < selfPetsMmr.length; petIdx++) {
            const selfPetMmr = selfPetsMmr[petIdx];
            let pet = pets[petIdx];

            if (selfPetMmr.catchIdx != pet.catchIdx) return true;
            if (selfPetMmr.lv != pet.lv) return true;
            if (selfPetMmr.rank != pet.rank) return true;
            if (selfPetMmr.state != pet.state) return true;
            if (selfPetMmr.lndFchrLen != pet.learnedFeatures.length) return true;
            if (selfPetMmr.prvty != pet.prvty) return true;
            for (let eqpIdx = 0; eqpIdx < selfPetMmr.eqpTokens.length; eqpIdx++) {
                if (selfPetMmr.eqpTokens[eqpIdx] != EquipDataTool.getToken(pet.equips[eqpIdx])) return true;
            }
        }
        return false;
    }

    start(spcBtlId: number = 0) {
        let seed = Date.now();
        setSeed(seed);

        // 更新battle
        this.resetRealBattle(spcBtlId);
        let rb = this.realBattle;

        if (this.debugMode) {
            this.realBattleCopys.length = 0;
            this.realBattleCopys.push({ seed: getCurSeed(), rb: <RealBattle>deepCopy(rb) });
        }

        // 更新memory
        GameDataTool.createBattle(
            this.gameData,
            seed,
            rb.enemyTeam.pets.map<Pet>(
                (value: BattlePet): Pet => {
                    return value.pet;
                }
            ),
            spcBtlId
        );

        // 更新UI
        this.page.setUIofEnemyPet(-1);

        // 日志
        let hiding = this.gameData.curExpl.hiding;
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

    resetRealBattle(spcBtlId: number) {
        let rb = this.realBattle;
        rb.enemyTeam = new BattleTeam();

        let mpMax = 0;
        let last = null;

        let enemyPetDatas: EnemyPetData[];
        if (spcBtlId) {
            // llytodo
        } else enemyPetDatas = this.createEnemyData();

        for (let index = 0; index < enemyPetDatas.length; index++) {
            const enemyPet = enemyPetDatas[index];

            let petData = PetDataTool.create(enemyPet.id, enemyPet.lv, enemyPet.rank, enemyPet.features, null);
            if (spcBtlId) petData.master = 'spcBtl';
            let battlePet = new BattlePet();
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
        if (randomRate(0.5)) {
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

    createEnemyData(): EnemyPetData[] {
        let gameData = this.gameData;
        let posId = gameData.curPosId;
        let curPosModel = actPosModelDict[posId];
        let explModel: ExplModel = <ExplModel>curPosModel.actDict['exploration'];

        let petCountMax = curPosModel.lv < 10 ? 4 : 5;
        let petCount = random(petCountMax) + 1;
        let step = gameData.curExpl.curStep;
        let curStepModel = explModel.stepModels[step];

        let enmeyPetType1 = getRandomOneInList(curStepModel.petIds);
        let enmeyPetType2 = getRandomOneInList(curStepModel.petIds);

        let enemyPetDatas: EnemyPetData[] = [];
        for (let index = 0; index < petCount; index++) {
            let id = randomRate(0.5) ? enmeyPetType1 : enmeyPetType2;
            let lv = Math.min(Math.max(1, curPosModel.lv - 2 + normalRandom(5)), expModels.length);
            let rank = normalRandom(step * 2) + 1;
            let features = [];

            let featureR = Math.random();
            if (lv > 5 && featureR > 0.3) features.push(this.createInbornFeature()); // 有一定等级的野外怪物才会有天赋
            if (lv > 10 && featureR > 0.8) features.push(this.createInbornFeature());

            enemyPetDatas.push({ id, lv, rank, features });
        }
        return enemyPetDatas;
    }

    createInbornFeature(): Feature {
        let feature = new Feature();
        feature.id = getRandomOneInList(inbornFeatures);
        feature.lv = 1 + Math.floor(Math.pow(Math.random(), 3) * 10); // 使用3次方，使随机结果更小
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

        let team = this.realBattle.selfTeam;
        this.page.resetAttriBar(team.mp, team.mpMax, team.rage);

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
        let newBuffDataList: { aim: BattlePet; caster: BattlePet; id: string; time: number }[] = [];

        for (const pet of team.pets) {
            for (let index = 0; index < pet.buffDatas.length; index++) {
                const buffData = pet.buffDatas[index];
                buffData.time--;

                let buffModel = buffModelDict[buffData.id];
                if (buffModel.hasOwnProperty('onTurnEnd')) {
                    let buffOutput = buffModel.onTurnEnd(pet, buffData, this);
                    if (buffOutput) {
                        if (buffOutput.hp) {
                            let dmg = buffOutput.hp;
                            if (dmg > 0) {
                                dmg *= BattleController.getEleDmgRate(buffModel.eleType, pet, buffData.caster);
                                dmg *= (1 - pet.pet2.dfsRate) * FormationHitRate[pet.fromationIdx];
                            }
                            dmg = Math.floor(dmg);
                            pet.hp -= dmg;
                            if (pet.hp < 1) pet.hp = 1;
                            else if (pet.hp > pet.hpMax) pet.hp = pet.hpMax;
                            this.page.doHurt(pet.beEnemy, pet.idx, pet.hp, pet.hpMax, dmg, false, 0);
                        }
                        // handleBuff中的mp和rage变化不用同步到UI上，因为handleBuff在gotoNextRound中，而此函数出现的地方CenterBar可控
                        if (buffOutput.mp) {
                            team.mp -= buffOutput.mp;
                            if (team.mp < 0) team.mp = 0;
                            else if (team.mp > team.mpMax) team.mp = team.mpMax;
                        }
                        if (buffOutput.rage) {
                            team.rage -= buffOutput.rage;
                            if (team.rage < 0) team.rage = 0;
                            else if (team.rage > RAGE_MAX) team.rage = RAGE_MAX;
                        }
                        if (buffOutput.newBuffs) {
                            for (const { aim, id, time } of buffOutput.newBuffs) {
                                newBuffDataList.push({ aim: aim || pet, caster: buffData.caster, id, time });
                            }
                        }
                    }
                }

                if (buffData.time == 0) {
                    if (buffModel.hasOwnProperty('onEnd')) buffModel.onEnd(pet, buffData.caster, buffData.data, this);
                    this.page.removeBuff(pet.beEnemy, pet.idx, buffData.id);
                    pet.buffDatas.splice(index, 1);
                    index--;
                } else {
                    this.page.resetBuffTime(pet.beEnemy, pet.idx, buffData.id, buffData.time);
                }
            }
        }

        for (const { aim, caster, id, time } of newBuffDataList) {
            this.addBuff(aim, caster, id, time);
        }
    }

    attack(battlePet: BattlePet): boolean {
        do {
            let done: boolean;
            done = this.castUltimateSkill(battlePet);
            if (done) break;

            done = this.castNormalSkill(battlePet);
            if (done) break;

            done = this.doNormalAttack(battlePet);
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

            let sklRealDmg = BattleController.getSklDmg(battlePet, aim);
            let atkRealDmg = BattleController.getAtkDmg(battlePet, aim);
            finalDmg = BattleController.getCastRealDmg(sklRealDmg, dmgRate * 0.01, atkRealDmg);

            finalDmg *= BattleController.getEleDmgRate(skillModel.eleType, aim, battlePet);
            finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        } else {
            finalDmg = BattleController.getSklDmg(battlePet, aim) * dmgRate * 0.01;
        }

        finalDmg = Math.floor(finalDmg);

        let lastHp = aim.hp;
        aim.hp -= finalDmg;

        if (dmgRate > 0) {
            battlePet.castingFeatures.forEach((value: AttackingFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            aim.hurtFeatures.forEach((value: HurtFeature) => {
                value.func(aim, battlePet, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            if (aim.hp < 0) aim.hp = 0;
            else if (aim.hp > lastHp - 1) aim.hp = lastHp - 1;
        } else {
            battlePet.healingFeatures.forEach((value: HealingFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            if (aim.hp > aim.hpMax) aim.hp = aim.hpMax;
        }

        finalDmg = lastHp - aim.hp;

        this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        this.logAtk(battlePet, aim, finalDmg, this.realBattle.combo > 1, skillModel.cnName, skillModel.eleType);

        if (dmgRate > 0) {
            let baseRage: number;
            if (skillModel.aimType == SkillAimtype.oneAndOthers) baseRage = 1;
            else if (skillModel.aimType == SkillAimtype.oneAndNext) baseRage = 2;
            else baseRage = 3;
            this.addRageToAim(battlePet, aim, baseRage);
        }

        if (aim.hp == 0) {
            this.dead(aim, battlePet);
            return false;
        } else {
            return true;
        }
    }

    static getCastRealDmg(sklRealDmg: number, dmgRate: number, atkRealDmg: number): number {
        return sklRealDmg * dmgRate + atkRealDmg;
    }

    static getEleDmgRate(skillEleType: EleType, aim: BattlePet, caster: BattlePet) {
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
        let buffModel = buffModelDict[buffId];
        for (let index = 0; index < aim.buffDatas.length; index++) {
            const buffData = aim.buffDatas[index];
            if (buffData.id == buffId) {
                if (buffTime > buffData.time) buffData.time = buffTime;
                return;
            }
        }

        let buffData = new BattleBuff();
        buffData.id = buffId;
        buffData.time = buffTime;
        buffData.caster = caster;
        if (buffModel.hasOwnProperty('onStarted')) buffData.data = buffModel.onStarted(aim, caster, this);
        this.page.addBuff(aim.beEnemy, aim.idx, buffId, buffTime);
        this.logBuff(aim, buffModel.cnName);
        aim.buffDatas.push(buffData);
    }

    doNormalAttack(battlePet: BattlePet): boolean {
        let aim: BattlePet = this.getAim(battlePet, false);
        if (!aim) return false;

        let hitResult = this.getHitResult(battlePet, aim);
        if (hitResult == 0) {
            this.page.doMiss(aim.beEnemy, aim.idx, this.realBattle.combo);
            this.logMiss(battlePet, aim, '普攻');
            return true;
        }

        let finalDmg = BattleController.getAtkDmg(battlePet, aim);
        finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        if (this.realBattle.atkRound > 100) finalDmg *= 1.5; // 时间太长时增加伤害快速结束
        finalDmg = Math.floor(finalDmg);
        aim.hp -= finalDmg;

        battlePet.attackingFeatures.forEach((value: AttackingFeature) => {
            value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel: null });
        });
        aim.hurtFeatures.forEach((value: HurtFeature) => {
            value.func(aim, battlePet, value.datas, { ctrlr: this, finalDmg, skillModel: null });
        });

        if (aim.hp < 0) aim.hp = 0;

        this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        this.logAtk(battlePet, aim, finalDmg, this.realBattle.combo > 1, '普攻');

        this.addRageToAim(battlePet, aim, 2);
        this.addMp(battlePet, aim);

        if (aim.hp == 0) this.dead(aim, battlePet);

        return true;
    }

    addRageToAim(battlePet: BattlePet, aim: BattlePet, baseRage: number) {
        let rage = baseRage + (aim.pet.lv < battlePet.pet.lv ? 1 : 0);

        let team = this.getTeam(aim);
        team.rage += rage;
        if (team.rage > RAGE_MAX) team.rage = RAGE_MAX;
    }

    addMp(battlePet: BattlePet, aim: BattlePet) {
        let mp = 3 + (aim.pet.lv > battlePet.pet.lv ? 1 : 0) + (aim.pet.rank > battlePet.pet.rank ? 1 : 0);

        let team = this.getTeam(battlePet);
        team.mp += mp;
        if (team.mp > team.mpMax) team.mp = team.mpMax;
    }

    static getAtkDmg(thisPet: BattlePet, aim: BattlePet) {
        let pet2 = thisPet.pet2;
        let dmg = pet2.atkDmgFrom + ranWithSeedInt(1 + pet2.atkDmgTo - pet2.atkDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    static getSklDmg(thisPet: BattlePet, aim: BattlePet) {
        let pet2 = thisPet.pet2;
        let dmg = pet2.sklDmgFrom + ranWithSeedInt(1 + pet2.sklDmgTo - pet2.sklDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
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
                petAlive.enemyDeadFeatures.forEach((value: EnemyDeadFeature) => {
                    value.func(petAlive, battlePet, caster, value.datas, this);
                });
            }

            battlePet.buffDatas.length = 0;
            this.page.removeBuff(battlePet.beEnemy, battlePet.idx, null);

            if (battlePet.beEnemy && battlePet.idx == this.gameData.curExpl.curBattle.catchPetIdx) {
                this.addCatchBuff(battlePet.idx);
            }

            for (let index = battlePet.idx + 1; index < curPets.length; index++) {
                const pet = curPets[index];
                pet.fromationIdx -= 1;
            }

            if (this.realBattle.lastAim == battlePet) this.realBattle.lastAim = null;
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
        GameDataTool.deleteBattle(this.gameData);

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
        let gameDataJIT = this.memory.gameDataJIT;

        for (const selfBPet of rb.selfTeam.pets) {
            let selfPet = selfBPet.pet;
            if (selfPet.lv >= expModels.length) return;

            let expTotal = 0;
            for (const eBPet of rb.enemyTeam.pets) {
                let ePet = eBPet.pet;
                let exp = (ePet.lv * 5 + 45) * (1 + ePet.rank * 0.05);
                if (ePet.lv >= selfPet.lv) exp *= 1 + (ePet.lv - selfPet.lv) * 0.05;
                else exp *= 1 - Math.min(selfPet.lv - ePet.lv, 8) / 8;
                expTotal += exp;
            }

            expTotal *= expRatebyPetCount;
            expTotal *= gameDataJIT.getAmplPercent(selfBPet.pet, AmplAttriType.exp);
            expTotal = Math.ceil(expTotal);

            let nextExp = selfPet.exp + expTotal;
            let curExpMax = expModels[selfPet.lv];

            if (nextExp >= curExpMax) {
                selfPet.lv++;
                selfPet.exp = 0;
                this.page.log(`${petModelDict[selfPet.id].cnName}升到了${selfPet.lv}级`);
            } else {
                selfPet.exp = nextExp;
                this.page.log(`${petModelDict[selfPet.id].cnName}获取到了${expTotal}点经验`);
            }
        }
    }

    executePetCatch() {
        let gameData = this.gameData;
        let catchIdx = gameData.curExpl.curBattle.catchPetIdx;
        if (catchIdx == -1) return;

        let battlePet = this.realBattle.enemyTeam.pets[catchIdx];

        // 计算是否成功捕捉
        let pet = battlePet.pet;
        let catchRate = CatchRatebyRank[pet.rank];

        let hightestLv = 0;
        for (const pet of this.realBattle.selfTeam.pets) hightestLv = Math.max(hightestLv, pet.pet.lv);

        if (hightestLv > pet.lv) {
            catchRate += (hightestLv - pet.lv) * 0.05;
        } else {
            catchRate -= (pet.lv - hightestLv) * 0.2;
        }

        let suc: boolean;
        if (catchRate >= 1) {
            suc = true;
        } else if (catchRate <= 0) {
            suc = false;
        } else {
            let catcherHaving = false; // 拥有当前级别或者更高级别的捕捉器 llytodo
            if (catcherHaving) catchRate *= 2;
            suc = randomRate(catchRate);
        }

        if (suc) {
            let rztStr = GameDataTool.addPet(this.gameData, pet.id, pet.lv, pet.rank, pet.inbornFeatures);
            if (rztStr == GameDataTool.SUC) {
                this.page.log(`成功捕获${petModelDict[pet.id].cnName}`);
            } else {
                this.page.log(`捕获失败，${rztStr}`);
            }
        } else {
            this.page.log(`捕获${petModelDict[pet.id].cnName}失败`);
        }
    }

    getAim(battlePet: BattlePet, toSelf: boolean, spBattleType: BattleType = null): BattlePet {
        let rb = this.realBattle;
        let battleType = spBattleType || this.getBattleType(battlePet);

        let aimPets: BattlePet[];
        if (toSelf) {
            aimPets = battlePet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
        } else {
            aimPets = battlePet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
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
                let anotherSidePets: BattlePet[];
                if (toSelf) {
                    anotherSidePets = battlePet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
                } else {
                    anotherSidePets = battlePet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
                }
                let pets = ranWithSeed() > 0.5 ? aimPets : anotherSidePets;
                aim = this.getPetAlive(pets[ranWithSeedInt(pets.length)]);
                break;
            default:
                break;
        }
        rb.lastAim = aim;
        return aim;
    }

    getBattleType(battlePet: BattlePet, skillModel: SkillModel = null) {
        let spBT = skillModel ? skillModel.spBattleType : null;
        return spBT || battlePet.pet2.exBattleTypes.getLast() || petModelDict[battlePet.pet.id].battleType;
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

        let curBattleId = this.gameData.curExpl.curBattle.startTime;
        if (curBattleId != battleId) return;

        let curCatchPetIdx = this.gameData.curExpl.curBattle.catchPetIdx;
        if (index == curCatchPetIdx) return;

        if (curCatchPetIdx >= 0) this.page.removeBuffByStr(true, curCatchPetIdx, '捕');
        this.gameData.curExpl.curBattle.catchPetIdx = index;
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
