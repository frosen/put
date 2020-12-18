/*
 * BtlCtrlr.ts
 * 战斗处理类
 * luleyan
 */

import { GameDataTool, PetTool } from '../scripts/Memory';
import { BtlPageBase } from './BtlPageBase';

import { skillModelDict } from '../configs/SkillModelDict';
import { buffModelDict } from '../configs/BuffModelDict';
import { petModelDict } from '../configs/PetModelDict';

import { deepCopy } from '../scripts/Utils';
import { SkillModel, SkillType, SkillAimtype, SkillDirType } from '../scripts/DataModel';
import { Pet, EleType, BattleType, GameData, BattleMmr, BioType } from '../scripts/DataSaved';
import { RealBattle, BattleTeam, BattlePet, BattleBuff, RageMax, BattlePetLenMax } from '../scripts/DataOther';
import { battleSequence } from '../configs/BattleSequence';
import { ExplUpdater, ExplLogType } from './ExplUpdater';

// random with seed -----------------------------------------------------------------

let seed = 5;
let seed2 = 10;

function setSeed(s: number) {
    seed = Math.abs(Math.floor(s)) % 199999;
    seed2 = seed;
}

function ranSd() {
    if (seed !== seed2) throw new Error('seed check wrong!');
    seed = (seed * 9301 + 49297) % 233280;
    seed2 = seed;
    return seed / 233280.0;
}

function ranSdInt(c: number) {
    return Math.floor(ranSd() * c);
}

function getCurSeed(): number {
    return seed;
}

// -----------------------------------------------------------------

const ComboHitRate = [0, 1, 1.1, 1.2]; // combo从1开始
const FormationHitRate = [1, 0.95, 0.9, 0.9, 0.85]; // 阵型顺序从0开始
const EleReinforceRelation = [0, 3, 1, 4, 2, 6, 5]; // 元素相克表

export class BtlCtrlr {
    updater: ExplUpdater = null;
    page: BtlPageBase = null;
    gameData: GameData = null;

    endCallback: (win: boolean) => void = null;

    realBattle: RealBattle = null;

    hiding: boolean = false;

    debugMode: boolean = false;
    realBattleCopys: { seed: number; rb: RealBattle }[] = []; // 用于战斗重置

    logging: boolean = true;

    init(updater: ExplUpdater, endCallback: (win: boolean) => void) {
        this.updater = updater;
        this.page = updater.page;
        this.gameData = updater.memory.gameData;
        this.endCallback = endCallback;

        this.realBattle = new RealBattle();

        // 快捷键
        this.page.ctrlr.debugTool.setShortCut('rr', this.resetBattleDataToBegin.bind(this));
        this.page.ctrlr.debugTool.setShortCut('bb', this.resetBattleDataToTurnBegin.bind(this));

        if (CC_DEBUG) this.debugMode = true;

        // @ts-ignore
        if (this.debugMode) window.btlCtrlr = this; // 便于测试
    }

    resetBattleDataToBegin() {
        if (!this.realBattle.start) {
            cc.log('PUT 没有战斗');
            return;
        }
        cc.log('PUT 重新开始当前战斗');

        this.realBattle = deepCopy(this.realBattleCopys[0].rb) as RealBattle;
        setSeed(this.realBattleCopys[0].seed);
        this.realBattleCopys.length = 1;
        this.resetAllUI();
        this.goReadyToBattle();
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
            const last = this.realBattleCopys.pop();
            this.realBattle = deepCopy(last.rb) as RealBattle;
            setSeed(last.seed);
            this.resetAllUI();
        }
    }

    resetAllUI() {
        this.page.setUIOfSelfPet(-1);
        this.page.setUIOfEnemyPet(-1);
        const team = this.realBattle.selfTeam;
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

    resetSelfTeam(mmr: BattleMmr = null) {
        this.realBattle.resetSelf(this.gameData, mmr ? mmr.selfs : null);
        if (this.page) {
            this.page.setUIOfSelfPet(-1);
            const mpMax = this.realBattle.selfTeam.mpMax;
            this.page.resetAttriBar(mpMax, mpMax, 0);
        }
    }

    startBattle(startUpdCnt: number, spcBtlId: number = null) {
        const seed = Date.now();
        setSeed(seed);

        // 更新battle
        const curExpl = this.gameData.curExpl;
        this.realBattle.resetEnemy(spcBtlId, null, curExpl);

        // 更新memory
        GameDataTool.createBattle(
            this.gameData,
            seed,
            startUpdCnt,
            spcBtlId,
            this.realBattle.enemyTeam.pets.map<Pet>(
                (value: BattlePet): Pet => {
                    return value.pet;
                }
            )
        );

        this.initBattle(this.realBattle);
        this.hiding = curExpl.hiding;

        if (this.debugMode) {
            this.realBattleCopys.length = 0;
            this.realBattleCopys.push({ seed: getCurSeed(), rb: <RealBattle>deepCopy(this.realBattle) });
        }

        this.goReadyToBattle();
    }

    resetBattle(battleMmr: BattleMmr) {
        setSeed(battleMmr.seed);

        // 更新battle
        const curExpl = this.gameData.curExpl;
        this.realBattle.resetEnemy(battleMmr.spcBtlId, battleMmr.enemys, curExpl);
        this.initBattle(this.realBattle);
        this.hiding = battleMmr.hiding;

        if (this.debugMode) {
            this.realBattleCopys.length = 0;
            this.realBattleCopys.push({ seed: getCurSeed(), rb: <RealBattle>deepCopy(this.realBattle) });
        }
        this.goReadyToBattle();
    }

    initBattle(rb: RealBattle) {
        // 更新UI和日志
        if (this.page) this.page.setUIOfEnemyPet(-1);

        const petNameDict = {};
        for (const ePet of this.realBattle.enemyTeam.pets) {
            const cnName = PetTool.getOriNameById(ePet.pet.id); // 避免太长，都用原始名
            petNameDict[cnName] = true;
        }

        if (this.logging) {
            const petNames = Object.keys(petNameDict);
            const str = '发现：' + petNames.join(', ') + '，进入战斗';
            this.updater.log(ExplLogType.rich, str);
        }
    }

    static calcSneakAttackTimes(selfPet: BattlePet, enemyPet: BattlePet): number {
        return Math.ceil(selfPet.pet2.agility / enemyPet.pet2.agility); // 敏捷每大于敌人100%，会让敌人多静止1回合
    }

    goReadyToBattle() {
        this.realBattle.curOrderIdx = 99; // 强制下次update切换回合
    }

    update() {
        const rb = this.realBattle;

        let nextOrderIdx = this.getNextOrderIndex();
        if (nextOrderIdx === -1) {
            if (this.debugMode) {
                this.realBattleCopys.push({ seed: getCurSeed(), rb: <RealBattle>deepCopy(rb) });
            }

            this.gotoNextRound();
            nextOrderIdx = this.getNextOrderIndex();
            if (nextOrderIdx === -1) {
                cc.error('错误的update，已经没有活着的精灵了');
                return;
            }
        }

        rb.atkRound++;
        rb.curOrderIdx = nextOrderIdx;
        rb.curSequenceIdx++;
        const startSequenceIdx = rb.sequnence[rb.curSequenceIdx];
        rb.combo = 1;

        // 执行当前精灵的攻击
        const curExePet: BattlePet = rb.order[nextOrderIdx];
        this.attack(curExePet);

        // 执行联合攻击
        while (true) {
            if (rb.start === false) break;
            const nextNextId = this.getNextOrderIndex();
            if (nextNextId === -1) break;
            if (rb.sequnence[rb.curSequenceIdx + 1] !== startSequenceIdx) break;

            rb.curOrderIdx = nextNextId;
            rb.curSequenceIdx++;
            rb.combo++;

            const nextPet = rb.order[nextNextId];
            const suc = this.attack(nextPet);
            if (!suc) rb.combo--; // 未成功攻击则不算连击
        }

        if (this.page) {
            const team = this.realBattle.selfTeam;
            this.page.resetAttriBar(team.mp, team.mpMax, team.rage);
        }
    }

    getNextOrderIndex(): number {
        const rb = this.realBattle;
        let idx = rb.curOrderIdx + 1;
        while (true) {
            if (idx >= rb.order.length) return -1;
            const curPet = rb.order[idx];
            if (curPet.hp > 0) return idx;
            idx++;
        }
    }

    gotoNextRound() {
        const rb = this.realBattle;

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

        let petAliveCnt = 0;
        for (const bPet of rb.order) if (bPet.hp > 0) petAliveCnt++;
        const sequennceList = battleSequence[petAliveCnt];
        rb.sequnence = sequennceList[ranSdInt(sequennceList.length)];

        rb.curOrderIdx = -1;
        rb.curSequenceIdx = -1;
        rb.battleRound++;
        rb.lastAim = null;

        if (this.logging) this.updater.log(ExplLogType.round, rb.battleRound);

        if (rb.battleRound === 1) this.doFirstRound();
    }

    handleCD(team: BattleTeam) {
        for (const pet of team.pets) {
            for (const skill of pet.skillDatas) {
                if (skill.cd > 0) skill.cd--;
            }
        }
    }

    handleBuff(team: BattleTeam) {
        const newBuffDataList: { aim: BattlePet; caster: BattlePet; id: string; time: number }[] = [];

        for (const pet of team.pets) {
            for (let buffIdx = pet.buffDatas.length - 1; buffIdx >= 0; buffIdx--) {
                const buffData = pet.buffDatas[buffIdx];
                buffData.time--;

                const buffModel = buffModelDict[buffData.id];
                if (buffModel.hasOwnProperty('onTurnEnd')) {
                    const buffOutput = buffModel.onTurnEnd(pet, buffData, this);
                    if (buffOutput) {
                        if (buffOutput.hp) {
                            let dmg = buffOutput.hp;
                            if (dmg > 0) {
                                dmg *= BtlCtrlr.getEleDmgRate(buffModel.eleType, pet, buffData.caster);
                                dmg *= (1 - pet.pet2.dfsRate) * FormationHitRate[pet.fromationIdx];
                            }
                            pet.hp -= dmg;
                            pet.hp = Math.floor(pet.hp);
                            if (pet.hp < 1) pet.hp = 1;
                            else if (pet.hp > pet.hpMax) pet.hp = pet.hpMax;
                            if (this.page) this.page.doHurt(pet.beEnemy, pet.idx, pet.hp, pet.hpMax, 0, false, 0);
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
                            else if (team.rage > RageMax) team.rage = RageMax;
                        }
                        if (buffOutput.newBuffs) {
                            for (const { aim, id, time } of buffOutput.newBuffs) {
                                newBuffDataList.push({ aim: aim || pet, caster: buffData.caster, id, time });
                            }
                        }
                    }
                }

                if (buffData.time === 0) {
                    if (buffModel.hasOwnProperty('onEnd')) buffModel.onEnd(pet, buffData.caster, this, buffData.data);
                    if (this.page) this.page.removeBuff(pet.beEnemy, pet.idx, buffData.id);
                    pet.buffDatas.splice(buffIdx, 1);
                } else {
                    if (this.page) this.page.resetBuffTime(pet.beEnemy, pet.idx, buffData.id, buffData.time);
                }
            }
        }

        for (const { aim, caster, id, time } of newBuffDataList) {
            this.addBuff(aim, caster, id, time);
        }
    }

    doFirstRound() {
        const rb = this.realBattle;

        // 偷袭
        if (this.hiding) {
            if (this.logging) this.updater.log(ExplLogType.rich, '偷袭成功');

            for (let index = 0; index < BattlePetLenMax; index++) {
                if (index >= rb.selfTeam.pets.length || index >= rb.enemyTeam.pets.length) break;
                const selfPet = rb.selfTeam.pets[index];
                const enemyPet = rb.enemyTeam.pets[index];
                const times = BtlCtrlr.calcSneakAttackTimes(selfPet, enemyPet);
                this.addBuff(enemyPet, selfPet, 'JingZhi', times);
            }
        }

        // 触发进入战斗特性
        for (const pet of rb.order) {
            pet.startFeatures.forEach((value: StartFeature) => {
                value.func(pet, value.datas, this);
            });
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

            if (this.logging) this.logStop(battlePet);
            return false; // 未成功攻击
        } while (false);

        if (this.page) this.page.doAttack(battlePet.beEnemy, battlePet.idx, this.realBattle.combo);
        return true; // 成功进行攻击
    }

    castUltimateSkill(battlePet: BattlePet): boolean {
        let done = false;
        for (const skillData of battlePet.skillDatas) {
            if (skillData.cd > 0) continue;
            const skillModel: SkillModel = skillModelDict[skillData.id];
            if (skillModel.skillType !== SkillType.ultimate) continue;

            const rageNeed = skillModel.rage;
            const team = this.getTeam(battlePet);
            if (team.rage < rageNeed) continue;

            const castSuc = this.cast(battlePet, skillModel);
            if (castSuc) {
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
            const skillModel: SkillModel = skillModelDict[skillData.id];
            if (skillModel.skillType === SkillType.ultimate) continue;

            const mpNeed = skillData.mpUsing;
            const team = this.getTeam(battlePet);
            if (team.mp < mpNeed) continue;

            const castSuc = this.cast(battlePet, skillModel);
            if (castSuc) {
                team.mp -= mpNeed;
                skillData.cd = skillModel.cd + 1;
                if (skillModel.skillType === SkillType.normal) done = true; // fast时done为false
                break;
            }
        }

        return done;
    }

    cast(battlePet: BattlePet, skillModel: SkillModel): boolean {
        const aim: BattlePet = this.getAim(battlePet, skillModel.dirType === SkillDirType.self, skillModel);
        if (!aim) return false;

        if (skillModel.hpLimit > 0 && (aim.hp / aim.hpMax) * 100 > skillModel.hpLimit) return false;

        if (skillModel.mainDmg > 0) {
            this.castDmg(battlePet, aim, skillModel.mainDmg, skillModel);
        }
        if (skillModel.mainBuffId && aim.hp > 0) {
            this.castBuff(battlePet, aim, skillModel, true);
        }

        if (skillModel.aimType === SkillAimtype.oneAndNext) {
            const nextAim = aim.next;
            if (nextAim) {
                // 分两次check hp是因为castDmg中也会把hp减为0
                if (skillModel.subDmg > 0 && nextAim.hp > 0) {
                    this.castDmg(battlePet, nextAim, skillModel.subDmg, skillModel);
                }
                if (skillModel.subBuffId && nextAim.hp > 0) {
                    this.castBuff(battlePet, nextAim, skillModel, false);
                }
            }
        } else if (skillModel.aimType === SkillAimtype.oneAndOthers) {
            const aimPets = this.getTeam(aim).pets;
            for (const aimInAll of aimPets) {
                if (aimInAll === aim || aimInAll.hp === 0) continue;
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
            hitResult = BtlCtrlr.getHitResult(battlePet, aim);
            if (hitResult === 0) {
                if (this.page) this.page.doMiss(aim.beEnemy, aim.idx, this.realBattle.combo);
                if (this.logging) this.logMiss(battlePet, aim, skillModel.cnName);
                return false;
            }

            const sklRealDmg = BtlCtrlr.getSklDmg(battlePet, aim);
            const atkRealDmg = BtlCtrlr.getAtkDmg(battlePet, aim);
            finalDmg = BtlCtrlr.getCastRealDmg(sklRealDmg, dmgRate * 0.01, atkRealDmg);

            finalDmg *= BtlCtrlr.getEleDmgRate(skillModel.eleType, aim, battlePet);
            finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        } else {
            finalDmg = BtlCtrlr.getSklDmg(battlePet, aim) * dmgRate * 0.01;
        }

        finalDmg *= BtlCtrlr.getRageDmgRate(this.getTeam(battlePet).rage);

        const lastHp = aim.hp;
        aim.hp -= finalDmg;

        if (dmgRate > 0) {
            battlePet.castFeatures.forEach((value: AtkFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            aim.hurtFeatures.forEach((value: HurtFeature) => {
                value.func(aim, battlePet, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            aim.hp = Math.floor(aim.hp);
            if (aim.hp < 0) aim.hp = 0;
            else if (aim.hp > lastHp - 1) aim.hp = lastHp - 1;
        } else {
            battlePet.healFeatures.forEach((value: HealFeature) => {
                value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel });
            });
            aim.hp = Math.floor(aim.hp);
            if (aim.hp > aim.hpMax) aim.hp = aim.hpMax;
        }

        finalDmg = lastHp - aim.hp;

        if (this.page) this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        if (this.logging) this.logAtk(battlePet, aim, finalDmg, skillModel.cnName, skillModel.eleType);

        if (dmgRate > 0) this.addRage(battlePet);

        if (aim.hp === 0) {
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
        let dmgGain: number;
        if (caster) dmgGain = BtlCtrlr.getEleType(caster) === skillEleType ? 1.05 : 1;
        else dmgGain = 1;

        const aimEleType = BtlCtrlr.getEleType(aim);
        const dmgRestricts = EleReinforceRelation[skillEleType] === aimEleType ? 1.15 : 1;
        return dmgGain * dmgRestricts;
    }

    static getRageDmgRate(rage: number): number {
        if (rage < 50) return 1;
        else if (rage < 100) return 1.1;
        else return 1.25;
    }

    castBuff(battlePet: BattlePet, aim: BattlePet, skillModel: SkillModel, beMain: boolean) {
        const buffId = beMain ? skillModel.mainBuffId : skillModel.subBuffId;
        const buffTime = beMain ? skillModel.mainBuffTime : skillModel.subBuffTime;
        this.addBuff(aim, battlePet, buffId, buffTime);
    }

    addBuff(aim: BattlePet, caster: BattlePet, buffId: string, buffTime: number) {
        const buffModel = buffModelDict[buffId];
        for (let index = 0; index < aim.buffDatas.length; index++) {
            const buffData = aim.buffDatas[index];
            if (buffData.id === buffId) {
                if (buffTime > buffData.time) buffData.time = buffTime;
                return;
            }
        }

        const buffData = new BattleBuff();
        buffData.id = buffId;
        buffData.time = buffTime;
        buffData.caster = caster;
        if (buffModel.hasOwnProperty('onStarted')) buffData.data = buffModel.onStarted(aim, caster, this);
        if (this.page) this.page.addBuff(aim.beEnemy, aim.idx, buffId, buffTime);
        if (this.logging) this.logBuff(aim, buffModel.cnName);
        aim.buffDatas.push(buffData);
    }

    doNormalAttack(battlePet: BattlePet): boolean {
        const aim: BattlePet = this.getAim(battlePet, false);
        if (!aim) return false;

        const hitResult = BtlCtrlr.getHitResult(battlePet, aim);
        if (hitResult === 0) {
            if (this.page) this.page.doMiss(aim.beEnemy, aim.idx, this.realBattle.combo);
            if (this.logging) this.logMiss(battlePet, aim, '普攻');
            return true;
        }

        let finalDmg = BtlCtrlr.getAtkDmg(battlePet, aim);
        finalDmg *= hitResult * ComboHitRate[this.realBattle.combo] * FormationHitRate[aim.fromationIdx];
        finalDmg *= BtlCtrlr.getRageDmgRate(this.getTeam(battlePet).rage);
        if (this.realBattle.atkRound > 150) finalDmg *= 10; // 时间太长则增加伤害尽快结束

        aim.hp -= finalDmg;

        battlePet.atkFeatures.forEach((value: AtkFeature) => {
            value.func(battlePet, aim, value.datas, { ctrlr: this, finalDmg, skillModel: null });
        });
        aim.hurtFeatures.forEach((value: HurtFeature) => {
            value.func(aim, battlePet, value.datas, { ctrlr: this, finalDmg, skillModel: null });
        });

        aim.hp = Math.floor(aim.hp);
        if (aim.hp < 0) aim.hp = 0;

        if (this.page) this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBattle.combo);
        if (this.logging) this.logAtk(battlePet, aim, finalDmg, '普攻');

        this.addRage(battlePet);
        this.addMp(battlePet, aim);

        if (aim.hp === 0) this.dead(aim, battlePet);

        return true;
    }

    addRage(battlePet: BattlePet) {
        const team = this.getTeam(battlePet);
        team.rage += 1; // 每次攻击命中+1，一回合一般5点，10回合50，20回合100
        if (team.rage > RageMax) team.rage = RageMax;
    }

    addMp(battlePet: BattlePet, aim: BattlePet) {
        const mp = 3 + (aim.pet.lv > battlePet.pet.lv ? 1 : 0);
        const team = this.getTeam(battlePet);
        team.mp += mp;
        if (team.mp > team.mpMax) team.mp = team.mpMax;
    }

    static getHitResult(battlePet: BattlePet, aim: BattlePet): number {
        const pet2 = battlePet.pet2;
        let hitRate = pet2.hitRate;

        // 命中等级修正
        const lvDiff = battlePet.pet.lv - aim.pet.lv;
        if (lvDiff > 0) {
            if (lvDiff === 1) hitRate += 0.01;
            else if (lvDiff === 2) hitRate += 0.03;
            else if (lvDiff === 3) hitRate += 0.09;
            else if (lvDiff === 4) hitRate += 0.27;
            else hitRate += 0.54;
        } else if (lvDiff < 0) {
            if (lvDiff === -1) hitRate -= 0.01;
            else if (lvDiff === -2) hitRate -= 0.03;
            else if (lvDiff === -3) hitRate -= 0.09;
            else if (lvDiff === -4) hitRate -= 0.27;
            else hitRate -= 0.54;
        }

        // 命中敏捷修正
        const agiProportion = pet2.agility / aim.pet2.agility;
        if (agiProportion > 1) hitRate = hitRate + 0.05 + (agiProportion - 1) * 0.2;
        else if (agiProportion < 1) hitRate = hitRate - 0.05 - (1 - agiProportion) * 0.3;

        let hitResult: number;
        if (ranSd() < hitRate - aim.pet2.evdRate) {
            if (ranSd() < pet2.critRate) hitResult = 1 + pet2.critDmgRate * (1 - aim.pet2.dfsRate);
            else hitResult = 1 * (1 - aim.pet2.dfsRate);
        } else hitResult = 0;

        return hitResult;
    }

    static getAtkDmg(thisPet: BattlePet, aim: BattlePet) {
        const pet2 = thisPet.pet2;
        const dmg = pet2.atkDmgFrom + ranSdInt(1 + pet2.atkDmgTo - pet2.atkDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    static getSklDmg(thisPet: BattlePet, aim: BattlePet) {
        const pet2 = thisPet.pet2;
        const dmg = pet2.sklDmgFrom + ranSdInt(1 + pet2.sklDmgTo - pet2.sklDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    dead(battlePet: BattlePet, caster: BattlePet) {
        if (this.logging) this.logDead(battlePet);

        const curPets = this.getTeam(battlePet).pets;
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
            this.getTeam(caster).pets.forEach((bPet: BattlePet) => {
                if (bPet.hp > 0) {
                    bPet.eDeadFeatures.forEach((value: EDeadFeature) => {
                        value.func(bPet, battlePet, caster, value.datas, this);
                    });
                }
            });

            battlePet.buffDatas.length = 0;
            if (this.page) this.page.removeBuff(battlePet.beEnemy, battlePet.idx, null);

            for (let index = battlePet.idx + 1; index < curPets.length; index++) {
                const pet = curPets[index];
                pet.fromationIdx -= 1;
            }

            if (this.realBattle.lastAim === battlePet) this.realBattle.lastAim = null;
        } else {
            this.endBattle(battlePet.beEnemy);
        }
    }

    endBattle(selfWin: boolean) {
        if (this.logging) this.updater.log(ExplLogType.repeat, selfWin ? '战斗胜利' : '战斗失败');
        this.exitBattle(selfWin);
    }

    exitBattle(selfWin: boolean) {
        const rb = this.realBattle;
        rb.start = false;

        if (this.endCallback) this.endCallback(selfWin); // callback中可能会用到battle数据，所以放在清理前

        GameDataTool.clearBattle(this.gameData);
        if (this.page) {
            // 清理敌人状态
            for (let index = 0; index < BattlePetLenMax; index++) {
                this.page.clearUIOfEnemyPet(index);
                this.page.removeBuff(true, index, null);
            }

            // 清理己方状态
            for (const selfPet of rb.selfTeam.pets) {
                selfPet.buffDatas.length = 0;
                this.page.removeBuff(selfPet.beEnemy, selfPet.idx, null);
                this.setSelfPetCtrlAimIdx(selfPet, true, -1);
                this.setSelfPetCtrlAimIdx(selfPet, false, -1);
                this.setSelfPetForbidSkl(selfPet, 0);
            }
        }
    }

    getAim(battlePet: BattlePet, toSelf: boolean, skillModel: SkillModel = null): BattlePet {
        const rb = this.realBattle;

        let aimPets: BattlePet[];
        if (toSelf) {
            aimPets = battlePet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
        } else {
            aimPets = battlePet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
        }

        const battleType = BtlCtrlr.getBattleType(battlePet, skillModel);
        const ctrlAimIdx = toSelf ? battlePet.ctrlSelfAimIdx : battlePet.ctrlEnemyAimIdx;
        if (ctrlAimIdx !== -1 && (!skillModel || !skillModel.spBattleType)) {
            const ctrlAim = aimPets[ctrlAimIdx];
            if (ctrlAim.hp === 0 || battleType === BattleType.stay || battleType === BattleType.chaos) {
                this.setSelfPetCtrlAimIdx(battlePet, toSelf, -1);
            } else {
                rb.lastAim = ctrlAim;
                return ctrlAim;
            }
        }

        let aim: BattlePet;
        switch (battleType) {
            case BattleType.melee:
                aim = BtlCtrlr.getPetAlive(aimPets[battlePet.idx] || aimPets.getLast());
                break;
            case BattleType.shoot:
                aim = BtlCtrlr.getPetAlive(aimPets[ranSdInt(aimPets.length)]);
                break;
            case BattleType.charge:
                aim = BtlCtrlr.getPetAlive(aimPets[0]);
                break;
            case BattleType.assassinate:
                for (const enemyPet of aimPets) {
                    if (enemyPet.hp > 0 && (!aim || enemyPet.hp < aim.hp)) aim = enemyPet;
                }
                break;
            case BattleType.combo:
                if (rb.lastAim && rb.lastAim.beEnemy === aimPets[0].beEnemy) {
                    aim = BtlCtrlr.getPetAlive(rb.lastAim);
                } else {
                    aim = BtlCtrlr.getPetAlive(aimPets[battlePet.idx] || aimPets[aimPets.length - 1]);
                }
                break;
            case BattleType.chaos: {
                if (ranSd() > 0.5) {
                    aim = BtlCtrlr.getPetAlive(aimPets[ranSdInt(aimPets.length)]);
                } else {
                    let anotherSidePets: BattlePet[];
                    if (toSelf) {
                        anotherSidePets = battlePet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
                    } else {
                        anotherSidePets = battlePet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
                    }
                    aim = BtlCtrlr.getPetAlive(anotherSidePets[ranSdInt(anotherSidePets.length)]);
                }
                break;
            }
            default:
                aim = null;
                break;
        }
        rb.lastAim = aim;
        return aim;
    }

    static getPetAlive(battlePet: BattlePet) {
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

    static getBioType(casterBPet: BattlePet): BioType {
        return casterBPet.pet2.exBioTypes.getLast() || petModelDict[casterBPet.pet.id].bioType;
    }

    static getEleType(casterBPet: BattlePet): EleType {
        return casterBPet.pet2.exEleTypes.getLast() || petModelDict[casterBPet.pet.id].eleType;
    }

    static getBattleType(casterBPet: BattlePet, skillModel: SkillModel = null): BattleType {
        const spBT = skillModel ? skillModel.spBattleType : null;
        return spBT || casterBPet.pet2.exBattleTypes.getLast() || petModelDict[casterBPet.pet.id].battleType;
    }

    // -----------------------------------------------------------------

    setSelfPetCtrlAimIdx(selfBPet: BattlePet, toSelf: boolean, aimIdx: number) {
        if (toSelf) selfBPet.ctrlSelfAimIdx = aimIdx;
        else selfBPet.ctrlEnemyAimIdx = aimIdx;
        if (this.page) this.page.setSelfAim(selfBPet.idx, toSelf, aimIdx);
    }

    setSelfPetForbidSkl(selfBPet: BattlePet, skl: number) {}

    // -----------------------------------------------------------------

    logAtk(battlePet: BattlePet, aim: BattlePet, dmg: number, skillName: string, eleType: EleType = null) {
        const dataList = [
            PetTool.getCnName(battlePet.pet),
            PetTool.getCnName(aim.pet),
            skillName,
            Math.floor(dmg * 0.1),
            eleType
        ];
        this.updater.log(ExplLogType.atk, dataList);
    }

    logMiss(battlePet: BattlePet, aim: BattlePet, skillName: string) {
        const dataList = [PetTool.getCnName(battlePet.pet), PetTool.getCnName(aim.pet), skillName];
        this.updater.log(ExplLogType.miss, dataList);
    }

    logBuff(aim: BattlePet, name: string) {
        const dataList = [PetTool.getCnName(aim.pet), name];
        this.updater.log(ExplLogType.buff, dataList);
    }

    logStop(battlePet: BattlePet) {
        this.updater.log(ExplLogType.stop, PetTool.getCnName(battlePet.pet));
    }

    logDead(battlePet: BattlePet) {
        this.updater.log(ExplLogType.dead, PetTool.getCnName(battlePet.pet));
    }

    ranSd() {
        return ranSd();
    }
}
