/*
 * BtlCtrlr.ts
 * 战斗处理类
 * luleyan
 */

import { GameDataTool, PetTool } from '../scripts/Memory';
import { BtlPageBase } from './BtlPageBase';

import { SkillModelDict } from '../configs/SkillModelDict';
import { BuffModelDict, BufN } from '../configs/BuffModelDict';
import { PetModelDict } from '../configs/PetModelDict';

import { deepCopy } from '../scripts/Utils';
import { SkillModel, SkillType, SkillRangeType, SkillDirType } from '../scripts/DataModel';
import { Pet, EleType, BtlType, GameData, BtlMmr, BioType } from '../scripts/DataSaved';
import { RealBtl, BtlTeam, BtlPet, BtlBuff, RageMax, BtlPetLenMax } from '../scripts/DataOther';
import { BtlSequence } from '../configs/BtlSequence';
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

// 元素相克表 1fire, 2water, 3air, 4earth, 5light, 6dark
const EleReinforceRelation = [
    [],
    [0, 1, 1, 1.15, 1, 1, 1],
    [0, 1.15, 1, 1, 1, 1, 1],
    [0, 1, 1, 1.05, 1.15, 1, 1],
    [0, 1, 1.15, 1, 0.95, 1, 1],
    [0, 1, 1, 1, 1, 1, 1.15],
    [0, 1.1, 1.1, 1.1, 1.1, 1, 1]
];

export class BtlCtrlr {
    gameData!: GameData;
    updater!: ExplUpdater;
    page?: BtlPageBase;

    endCallback?: (win: boolean) => void;

    realBtl!: RealBtl;

    hiding: boolean = false;

    debugMode: boolean = false;
    realBtlCopys: { seed: number; rb: RealBtl }[] = []; // 用于战斗重置

    logging: boolean = true;

    init(updater: ExplUpdater, endCallback: (win: boolean) => void) {
        this.updater = updater;
        this.page = updater.page;
        this.gameData = updater.memory.gameData;
        this.endCallback = endCallback;

        this.realBtl = new RealBtl();

        // 快捷键
        this.updater.ctrlr.debugTool.setShortCut('rr', this.resetBtlDataToStart.bind(this));
        this.updater.ctrlr.debugTool.setShortCut('bb', this.resetBtlDataToTurnStart.bind(this));

        if (CC_DEBUG) this.debugMode = true;

        // @ts-ignore
        if (this.debugMode) window.btlCtrlr = this; // 便于测试
    }

    resetBtlDataToStart() {
        if (!this.realBtl.start) {
            cc.log('PUT 没有战斗');
            return;
        }
        cc.log('PUT 重新开始当前战斗');

        this.realBtl = deepCopy(this.realBtlCopys[0].rb) as RealBtl;
        setSeed(this.realBtlCopys[0].seed);
        this.realBtlCopys.length = 1;
        this.resetAllUI();
        this.goReadyToBtl();
    }

    resetBtlDataToTurnStart() {
        if (!this.realBtl.start) {
            cc.log('PUT 没有战斗');
            return;
        }
        cc.log('PUT 回到上次回合开始');

        if (this.realBtlCopys.length <= 1) {
            this.resetBtlDataToStart();
        } else {
            const last = this.realBtlCopys.pop()!;
            this.realBtl = deepCopy(last.rb) as RealBtl;
            setSeed(last.seed);
            this.resetAllUI();
        }
    }

    resetAllUI() {
        const page = this.page!;
        page.setUIOfSelfPet(-1);
        page.setUIOfEnemyPet(-1);
        const team = this.realBtl.selfTeam;
        page.resetAttriBar(team.mp, team.mpMax, team.rage);
        for (const pet of team.pets) {
            page.removeBuff(pet.beEnemy, pet.idx, -1);
            for (let index = 0; index < pet.buffDatas.length; index++) {
                const { id, time } = pet.buffDatas[index];
                page.addBuff(pet.beEnemy, pet.idx, id, time, index);
            }
        }
        for (const pet of this.realBtl.enemyTeam.pets) {
            page.removeBuff(pet.beEnemy, pet.idx, -1);
            for (let index = 0; index < pet.buffDatas.length; index++) {
                const { id, time } = pet.buffDatas[index];
                page.addBuff(pet.beEnemy, pet.idx, id, time, index);
            }
        }
    }

    destroy() {
        this.updater.ctrlr.debugTool.removeShortCut('rr');
        this.updater.ctrlr.debugTool.removeShortCut('bb');
    }

    resetSelfTeam(mmr?: BtlMmr) {
        this.realBtl.resetSelf(this.gameData, mmr ? mmr.selfs : undefined);
        if (this.page) {
            this.page.setUIOfSelfPet(-1);
            const mpMax = this.realBtl.selfTeam.mpMax;
            this.page.resetAttriBar(mpMax, mpMax, 0);
        }
    }

    startBtl(startUpdCnt: number, spcBtlId?: string) {
        const seed = Date.now();
        setSeed(seed);

        // 更新battle
        const expl = this.gameData.expl!;
        this.realBtl.resetEnemy(expl, spcBtlId, undefined);

        // 更新memory
        GameDataTool.createBtl(
            this.gameData,
            seed,
            startUpdCnt,
            spcBtlId || '',
            this.realBtl.enemyTeam.pets.map<Pet>(
                (value: BtlPet): Pet => {
                    return value.pet;
                }
            )
        );

        this.initBtl(this.realBtl, spcBtlId);
        this.hiding = expl.hiding;

        if (this.debugMode) {
            this.realBtlCopys.length = 0;
            this.realBtlCopys.push({ seed: getCurSeed(), rb: <RealBtl>deepCopy(this.realBtl) });
        }

        this.goReadyToBtl();
    }

    resetBtl(btlMmr: BtlMmr) {
        setSeed(btlMmr.seed);

        // 更新battle
        const expl = this.gameData.expl!;
        this.realBtl.resetEnemy(expl, btlMmr.spcBtlId, btlMmr.enemys);
        this.initBtl(this.realBtl, btlMmr.spcBtlId);
        this.hiding = btlMmr.hiding;

        if (this.debugMode) {
            this.realBtlCopys.length = 0;
            this.realBtlCopys.push({ seed: getCurSeed(), rb: <RealBtl>deepCopy(this.realBtl) });
        }
        this.goReadyToBtl();
    }

    initBtl(rb: RealBtl, spcBtlId?: string) {
        // 更新UI和日志
        if (this.page) this.page.setUIOfEnemyPet(-1);

        const petNameDict: { [key: string]: boolean } = {};
        for (const ePet of this.realBtl.enemyTeam.pets) {
            const cnName = ePet.pet.nickname || PetTool.getOriNameById(ePet.pet.id); // 避免太长，都用原始名
            petNameDict[cnName] = true;
        }

        if (this.logging) {
            const petNames = Object.keys(petNameDict);
            let str = spcBtlId ? '发现BOSS：' : '发现：';
            str += petNames.join('、');
            str += spcBtlId ? '，准备战斗' : '，进入战斗';
            this.updater.log(ExplLogType.rich, str);
        }
    }

    static calcSneakAttackTimes(selfPet: BtlPet, enemyPet: BtlPet): number {
        return Math.ceil(selfPet.pet2.agility / enemyPet.pet2.agility); // 敏捷每大于敌人100%，会让敌人多静止1回合
    }

    goReadyToBtl() {
        this.realBtl.curOrderIdx = 99; // 强制下次update切换回合
    }

    update() {
        const rb = this.realBtl;

        let nextOrderIdx = this.getNextOrderIndex();
        if (nextOrderIdx === -1) {
            if (this.debugMode) {
                this.realBtlCopys.push({ seed: getCurSeed(), rb: <RealBtl>deepCopy(rb) });
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
        const curExePet: BtlPet = rb.order[nextOrderIdx];
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
            const team = this.realBtl.selfTeam;
            this.page.resetAttriBar(team.mp, team.mpMax, team.rage);
        }
    }

    getNextOrderIndex(): number {
        const rb = this.realBtl;
        let idx = rb.curOrderIdx + 1;
        while (true) {
            if (idx >= rb.order.length) return -1;
            const curPet = rb.order[idx];
            if (curPet.hp > 0) return idx;
            idx++;
        }
    }

    gotoNextRound() {
        const rb = this.realBtl;

        // 处理cd
        this.handleCD(rb.selfTeam);
        this.handleCD(rb.enemyTeam);

        // 处理buff
        this.handleBuff(rb.selfTeam);
        this.handleBuff(rb.enemyTeam);

        // 处理反应速度列表
        rb.order.sort((a: BtlPet, b: BtlPet): number => {
            return b.pet2.speed - a.pet2.speed;
        });

        let petAliveCnt = 0;
        for (const bPet of rb.order) if (bPet.hp > 0) petAliveCnt++;
        const sequenceList = BtlSequence[petAliveCnt];
        rb.sequnence = sequenceList[ranSdInt(sequenceList.length)];

        rb.curOrderIdx = -1;
        rb.curSequenceIdx = -1;
        rb.btlRound++;
        rb.lastAim = undefined;

        if (this.logging) this.updater.log(ExplLogType.round, rb.btlRound);

        if (rb.btlRound === 1) this.doFirstRound();

        // 触发回合特性
        for (const pet of rb.order) {
            if (pet.hp <= 0) continue;
            pet.turnFeatures.forEach(value => value.func(pet, value.datas, this));
        }
    }

    handleCD(team: BtlTeam) {
        for (const pet of team.pets) {
            for (const skill of pet.skillDatas) {
                if (skill.cd > 0) skill.cd--;
            }
        }
    }

    handleBuff(team: BtlTeam) {
        const newBuffDataList: { aim: BtlPet; caster: BtlPet; id: string; time: number; src: string }[] = [];

        for (const pet of team.pets) {
            let finalDmg = 0;
            for (let buffIdx = pet.buffDatas.length - 1; buffIdx >= 0; buffIdx--) {
                const buffData = pet.buffDatas[buffIdx];
                buffData.time--;

                const buffModel = BuffModelDict[buffData.id];
                if (buffModel.onTurnEnd) {
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
                            finalDmg += dmg;
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
                                const caster = buffData.caster;
                                const src = buffModel.cnName + '效果';
                                newBuffDataList.push({ aim: aim || pet, caster, id, time, src });
                            }
                        }
                    }
                }

                if (buffData.time === 0) {
                    if (buffModel.onEnd) buffModel.onEnd(pet, buffData.caster, this, buffData.data);
                    if (this.page) this.page.removeBuff(pet.beEnemy, pet.idx, buffIdx);
                    pet.buffDatas.splice(buffIdx, 1);
                } else {
                    if (this.page) this.page.resetBuffTime(pet.beEnemy, pet.idx, buffData.id, buffData.time, buffIdx);
                }
            }

            if (finalDmg !== 0) {
                if (this.page) this.page.doHurt(pet.beEnemy, pet.idx, pet.hp, pet.hpMax, finalDmg, false, 0);
                if (this.logging) this.logBuffHurt(pet, finalDmg);
            }
        }

        for (const { aim, caster, id, time, src } of newBuffDataList) {
            this.addBuff(aim, caster, id, time, src);
        }
    }

    doFirstRound() {
        const rb = this.realBtl;

        // 偷袭
        if (this.hiding) {
            if (this.logging) this.updater.log(ExplLogType.rich, '偷袭成功');

            for (let index = 0; index < BtlPetLenMax; index++) {
                if (index >= rb.selfTeam.pets.length || index >= rb.enemyTeam.pets.length) break;
                const selfPet = rb.selfTeam.pets[index];
                const enemyPet = rb.enemyTeam.pets[index];
                const times = BtlCtrlr.calcSneakAttackTimes(selfPet, enemyPet);
                this.addBuff(enemyPet, selfPet, BufN.JingZhi, times, '偷袭');
            }
        }

        // 触发进入战斗特性
        for (const pet of rb.order) {
            pet.startFeatures.forEach(value => value.func(pet, value.datas, this));
        }
    }

    attack(btlPet: BtlPet): boolean {
        do {
            let done: boolean;
            done = this.castUltimateSkill(btlPet);
            if (done) break;

            done = this.castNormalSkill(btlPet);
            if (done) break;

            done = this.doNormalAttack(btlPet);
            if (done) break;

            if (this.logging) this.logStop(btlPet);
            return false; // 未成功攻击
        } while (false);

        if (this.page) this.page.doAttack(btlPet.beEnemy, btlPet.idx, this.realBtl.combo);
        return true; // 成功进行攻击
    }

    castUltimateSkill(btlPet: BtlPet): boolean {
        let done = false;
        for (let index = 0; index < btlPet.skillDatas.length; index++) {
            if (((btlPet.sklForbidFlag >> index) & 1) === 1) continue;

            const skillData = btlPet.skillDatas[index];
            if (skillData.cd > 0) continue;

            const skillModel: SkillModel = SkillModelDict[skillData.id];
            if (skillModel.skillType !== SkillType.ultimate) continue;

            const rageNeed = skillModel.rage!;
            const team = this.getTeam(btlPet);
            if (team.rage < rageNeed) continue;

            const castSuc = this.cast(btlPet, skillModel);
            if (castSuc) {
                skillData.cd = 999;
                done = true;
                break;
            }
        }

        return done;
    }

    castNormalSkill(btlPet: BtlPet): boolean {
        let done = false;
        for (let index = 0; index < btlPet.skillDatas.length; index++) {
            if (((btlPet.sklForbidFlag >> index) & 1) === 1) continue;

            const skillData = btlPet.skillDatas[index];
            if (skillData.cd > 0) continue;

            const skillModel: SkillModel = SkillModelDict[skillData.id];
            if (skillModel.skillType === SkillType.ultimate) continue;

            const mpNeed = skillData.mpUsing;
            const team = this.getTeam(btlPet);
            if (team.mp < mpNeed) continue;

            const castSuc = this.cast(btlPet, skillModel);
            if (castSuc) {
                team.mp -= mpNeed;
                skillData.cd = skillModel.cd! + 1;
                if (skillModel.skillType === SkillType.normal) done = true; // fast时done为false
                break;
            }
        }

        return done;
    }

    cast(btlPet: BtlPet, skillModel: SkillModel): boolean {
        const aim = this.getAim(btlPet, skillModel.dirType === SkillDirType.self, skillModel);
        if (!aim) return false;

        if (skillModel.hpLimit && (aim.hp / aim.hpMax) * 100 > skillModel.hpLimit) return false;

        if (skillModel.mainDmg) {
            this.castDmg(btlPet, aim, skillModel.mainDmg, skillModel);
        }
        if (skillModel.mainBuffId && aim.hp > 0) {
            this.castBuff(btlPet, aim, skillModel, true);
        }

        if (skillModel.rangeType === SkillRangeType.oneAndNext) {
            const nextAim = aim.next;
            if (nextAim) {
                // 分两次check hp是因为castDmg中也会把hp减为0
                if (skillModel.subDmg && nextAim.hp > 0) {
                    this.castDmg(btlPet, nextAim, skillModel.subDmg, skillModel);
                }
                if (skillModel.subBuffId && nextAim.hp > 0) {
                    this.castBuff(btlPet, nextAim, skillModel, false);
                }
            }
        } else if (skillModel.rangeType === SkillRangeType.oneAndOthers) {
            const aimPets = this.getTeam(aim).pets;
            for (const aimInAll of aimPets) {
                if (aimInAll === aim || aimInAll.hp === 0) continue;
                if (skillModel.subDmg) this.castDmg(btlPet, aimInAll, skillModel.subDmg, skillModel);
                if (skillModel.subBuffId && aimInAll.hp > 0) {
                    this.castBuff(btlPet, aimInAll, skillModel, false);
                }
            }
        }

        return true;
    }

    getTeam(pet: BtlPet): BtlTeam {
        return pet.beEnemy ? this.realBtl.enemyTeam : this.realBtl.selfTeam;
    }

    castDmg(btlPet: BtlPet, aim: BtlPet, dmgRate: number, skillModel: SkillModel): boolean {
        let finalDmg: number;
        let hitResult = 1;
        if (dmgRate > 0) {
            hitResult = BtlCtrlr.getHitResult(btlPet, aim);
            if (hitResult === 0) {
                if (this.page) this.page.doMiss(aim.beEnemy, aim.idx, this.realBtl.combo);
                if (this.logging) this.logMiss(btlPet, aim, skillModel.cnName);
                return false;
            }

            const sklRealDmg = BtlCtrlr.getSklDmg(btlPet, aim);
            const atkRealDmg = BtlCtrlr.getAtkDmg(btlPet, aim);
            finalDmg = BtlCtrlr.getCastRealDmg(sklRealDmg, dmgRate * 0.01, atkRealDmg);

            finalDmg *= BtlCtrlr.getEleDmgRate(skillModel.eleType, aim, btlPet);
            finalDmg *= hitResult * ComboHitRate[this.realBtl.combo] * FormationHitRate[aim.fromationIdx];
        } else {
            finalDmg = BtlCtrlr.getSklDmg(btlPet, aim) * dmgRate * 0.01;
        }

        finalDmg *= BtlCtrlr.getRageDmgRate(this.getTeam(btlPet).rage);

        const lastHp = aim.hp;
        aim.hp -= finalDmg;

        const btlData = { ctrlr: this, finalDmg, skillModel };
        if (dmgRate > 0) {
            btlPet.castFeatures.forEach(value => value.func(btlPet, aim, value.datas, btlData));
            aim.hurtFeatures.forEach(value => value.func(aim, btlPet, value.datas, btlData));
            aim.hp = Math.floor(aim.hp);
            if (aim.hp < 0) aim.hp = 0;
            else if (aim.hp > lastHp - 1) aim.hp = lastHp - 1;
        } else {
            btlPet.healFeatures.forEach(value => value.func(btlPet, aim, value.datas, btlData));
            aim.hp = Math.floor(aim.hp);
            if (aim.hp > aim.hpMax) aim.hp = aim.hpMax;
        }

        finalDmg = lastHp - aim.hp;

        if (this.page) this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBtl.combo);
        if (this.logging) this.logAtk(btlPet, aim, finalDmg, skillModel.cnName, skillModel.eleType);

        if (dmgRate > 0) this.addRage(btlPet);

        if (aim.hp === 0) {
            this.dead(aim, btlPet);
            return false;
        } else {
            return true;
        }
    }

    static getCastRealDmg(sklRealDmg: number, dmgRate: number, atkRealDmg: number): number {
        return sklRealDmg * dmgRate + atkRealDmg;
    }

    static getEleDmgRate(skillEleType: EleType, aim: BtlPet, caster?: BtlPet) {
        let dmgGain: number;
        if (caster) dmgGain = BtlCtrlr.getEleType(caster) === skillEleType ? 1.05 : 1;
        else dmgGain = 1;

        const aimEleType = BtlCtrlr.getEleType(aim);
        const dmgRestricts = EleReinforceRelation[skillEleType][aimEleType];
        return dmgGain * dmgRestricts;
    }

    static getRageDmgRate(rage: number): number {
        if (rage < 50) return 1;
        else if (rage < 100) return 1.1;
        else return 1.25;
    }

    castBuff(btlPet: BtlPet, aim: BtlPet, skillModel: SkillModel, beMain: boolean) {
        const buffId = beMain ? skillModel.mainBuffId : skillModel.subBuffId;
        const buffTime = beMain ? skillModel.mainBuffTime : skillModel.subBuffTime;
        this.addBuff(aim, btlPet, buffId!, buffTime!, skillModel.cnName);
    }

    addBuff(aim: BtlPet, caster: BtlPet, buffId: string, buffTime: number, src: string) {
        const buffData = new BtlBuff();
        buffData.id = buffId;
        buffData.time = buffTime;
        buffData.caster = caster;
        aim.buffDatas.push(buffData);

        const buffModel = BuffModelDict[buffId];
        if (buffModel.onStarted) buffData.data = buffModel.onStarted(aim, caster, this);
        if (this.page) this.page.addBuff(aim.beEnemy, aim.idx, buffId, buffTime, aim.buffDatas.length - 1);
        if (this.logging) this.logBuff(aim, buffModel.cnName, caster, src);
    }

    doNormalAttack(btlPet: BtlPet): boolean {
        const aim = this.getAim(btlPet, false);
        if (!aim) return false;

        const hitResult = BtlCtrlr.getHitResult(btlPet, aim);
        if (hitResult === 0) {
            if (this.page) this.page.doMiss(aim.beEnemy, aim.idx, this.realBtl.combo);
            if (this.logging) this.logMiss(btlPet, aim, '普攻');
            return true;
        }

        let finalDmg = BtlCtrlr.getAtkDmg(btlPet, aim);
        finalDmg *= hitResult * ComboHitRate[this.realBtl.combo] * FormationHitRate[aim.fromationIdx];
        finalDmg *= BtlCtrlr.getRageDmgRate(this.getTeam(btlPet).rage);
        if (this.realBtl.atkRound > 150) finalDmg *= 10; // 时间太长则增加伤害尽快结束

        aim.hp -= finalDmg;

        const btlData = { ctrlr: this, finalDmg };
        btlPet.atkFeatures.forEach(value => value.func(btlPet, aim, value.datas, btlData));
        aim.hurtFeatures.forEach(value => value.func(aim, btlPet, value.datas, btlData));

        aim.hp = Math.floor(aim.hp);
        if (aim.hp < 0) aim.hp = 0;

        if (this.page) this.page.doHurt(aim.beEnemy, aim.idx, aim.hp, aim.hpMax, finalDmg, hitResult > 1, this.realBtl.combo);
        if (this.logging) this.logAtk(btlPet, aim, finalDmg, '普攻');

        this.addRage(btlPet);
        this.addMp(btlPet, aim);

        if (aim.hp === 0) this.dead(aim, btlPet);

        return true;
    }

    addRage(btlPet: BtlPet) {
        const team = this.getTeam(btlPet);
        team.rage += 1; // 每次攻击命中+1，一回合一般5点，10回合50，20回合100
        if (team.rage > RageMax) team.rage = RageMax;
    }

    addMp(btlPet: BtlPet, aim: BtlPet) {
        const mp = 3 + (aim.pet.lv > btlPet.pet.lv ? 1 : 0);
        const team = this.getTeam(btlPet);
        team.mp += mp;
        if (team.mp > team.mpMax) team.mp = team.mpMax;
    }

    static getHitResult(btlPet: BtlPet, aim: BtlPet): number {
        const pet2 = btlPet.pet2;
        let hitRate = pet2.hitRate;

        // 命中等级修正
        const lvDiff = btlPet.pet.lv - aim.pet.lv;
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

    static getAtkDmg(thisPet: BtlPet, aim?: BtlPet) {
        const pet2 = thisPet.pet2;
        const dmg = pet2.atkDmgFrom + ranSdInt(1 + pet2.atkDmgTo - pet2.atkDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    static getSklDmg(thisPet: BtlPet, aim?: BtlPet) {
        const pet2 = thisPet.pet2;
        const dmg = pet2.sklDmgFrom + ranSdInt(1 + pet2.sklDmgTo - pet2.sklDmgFrom);
        return aim ? Math.max(dmg - aim.pet2.armor, 1) : dmg;
    }

    dead(btlPet: BtlPet, caster: BtlPet) {
        if (this.logging) this.logDead(btlPet);

        const curPets = this.getTeam(btlPet).pets;
        let alive = false;
        for (const pet of curPets) {
            if (pet.hp > 0) {
                alive = true;
                break;
            }
        }

        if (alive) {
            btlPet.deadFeatures.forEach(value => value.func(btlPet, caster, value.datas, this));
            for (const bPet of this.getTeam(caster).pets) {
                if (bPet.hp <= 0) continue;
                bPet.eDeadFeatures.forEach(value => value.func(bPet, btlPet, caster, value.datas, this));
            }

            btlPet.buffDatas.length = 0;
            if (this.page) this.page.removeBuff(btlPet.beEnemy, btlPet.idx, -1);

            if (!btlPet.beEnemy) {
                this.setSelfPetCtrlAimIdx(btlPet, true, -1);
                this.setSelfPetCtrlAimIdx(btlPet, false, -1);
                this.switchSelfPetForbidSkl(btlPet, -1);
            }

            for (let index = btlPet.idx + 1; index < curPets.length; index++) {
                const pet = curPets[index];
                pet.fromationIdx -= 1;
            }

            if (this.realBtl.lastAim === btlPet) this.realBtl.lastAim = undefined;
        } else {
            this.endBtl(btlPet.beEnemy);
        }
    }

    endBtl(selfWin: boolean) {
        if (this.logging) this.updater.log(ExplLogType.repeat, selfWin ? '战斗胜利' : '战斗失败');
        this.exitBtl(selfWin);
    }

    exitBtl(selfWin: boolean) {
        const rb = this.realBtl;
        rb.start = false;

        if (this.endCallback) this.endCallback(selfWin); // callback中可能会用到battle数据，所以放在清理前

        GameDataTool.clearBtl(this.gameData);

        // 清理敌人状态
        if (this.page) {
            for (let index = 0; index < BtlPetLenMax; index++) {
                this.page.clearUIOfEnemyPet(index);
                this.page.removeBuff(true, index, -1);
            }
        }

        // 清理己方状态
        for (const selfPet of rb.selfTeam.pets) {
            selfPet.buffDatas.length = 0;
            if (this.page) this.page.removeBuff(selfPet.beEnemy, selfPet.idx, -1);
            this.setSelfPetCtrlAimIdx(selfPet, true, -1);
            this.setSelfPetCtrlAimIdx(selfPet, false, -1);
            this.switchSelfPetForbidSkl(selfPet, -1);
        }
    }

    getAim(btlPet: BtlPet, toSelf: boolean, skillModel?: SkillModel): BtlPet | undefined {
        const rb = this.realBtl;

        let aimPets: BtlPet[];
        if (btlPet.beEnemy) {
            aimPets = toSelf ? rb.enemyTeam.pets : rb.selfTeam.pets;
        } else {
            aimPets = toSelf ? rb.selfTeam.pets : rb.enemyTeam.pets;
        }

        if (!btlPet.beEnemy && !btlPet.pet2.exBtlTypes.getLast() && !(skillModel && skillModel.spBtlType)) {
            const ctrlAimIdx = toSelf ? btlPet.ctrlSelfAimIdx : btlPet.ctrlEnemyAimIdx;
            if (ctrlAimIdx !== -1) {
                const ctrlAim = aimPets[ctrlAimIdx];
                if (ctrlAim.hp <= 0) {
                    this.setSelfPetCtrlAimIdx(btlPet, toSelf, -1);
                } else {
                    rb.lastAim = ctrlAim;
                    return ctrlAim;
                }
            }
        }

        let aim: BtlPet | undefined;
        switch (BtlCtrlr.getBtlType(btlPet, skillModel)) {
            case BtlType.melee:
                aim = BtlCtrlr.getPetAlive(aimPets[btlPet.idx] || aimPets.getLast());
                break;
            case BtlType.shoot:
                aim = BtlCtrlr.getPetAlive(aimPets[ranSdInt(aimPets.length)]);
                break;
            case BtlType.charge:
                aim = BtlCtrlr.getPetAlive(aimPets[0]);
                break;
            case BtlType.assassinate:
                for (const enemyPet of aimPets) {
                    if (enemyPet.hp > 0 && (!aim || enemyPet.hp < aim.hp)) aim = enemyPet;
                }
                break;
            case BtlType.combo:
                if (rb.lastAim && rb.lastAim.beEnemy === aimPets[0].beEnemy) {
                    aim = BtlCtrlr.getPetAlive(rb.lastAim);
                } else {
                    aim = BtlCtrlr.getPetAlive(aimPets[btlPet.idx] || aimPets[aimPets.length - 1]);
                }
                break;
            case BtlType.chaos: {
                if (ranSd() > 0.5) {
                    aim = BtlCtrlr.getPetAlive(aimPets[ranSdInt(aimPets.length)]);
                } else {
                    let anotherSidePets: BtlPet[];
                    if (toSelf) {
                        anotherSidePets = btlPet.beEnemy ? rb.selfTeam.pets : rb.enemyTeam.pets;
                    } else {
                        anotherSidePets = btlPet.beEnemy ? rb.enemyTeam.pets : rb.selfTeam.pets;
                    }
                    aim = BtlCtrlr.getPetAlive(anotherSidePets[ranSdInt(anotherSidePets.length)]);
                }
                break;
            }
        }
        rb.lastAim = aim;
        return aim;
    }

    static getPetAlive(btlPet: BtlPet) {
        let usingNext = true;
        let curPet = btlPet;
        while (true) {
            if (curPet.hp > 0) return curPet;
            if (usingNext) {
                if (curPet.next) curPet = curPet.next;
                else usingNext = false;
            } else {
                curPet = curPet.last!;
            }
        }
    }

    static getBioType(casterBPet: BtlPet): BioType {
        return casterBPet.pet2.exBioTypes.getLast() || PetModelDict[casterBPet.pet.id].bioType;
    }

    static getEleType(casterBPet: BtlPet): EleType {
        return casterBPet.pet2.exEleTypes.getLast() || PetModelDict[casterBPet.pet.id].eleType;
    }

    static getBtlType(casterBPet: BtlPet, skillModel?: SkillModel): BtlType {
        const spBT = skillModel ? skillModel.spBtlType : undefined;
        return spBT || casterBPet.pet2.exBtlTypes.getLast() || PetModelDict[casterBPet.pet.id].btlType;
    }

    // -----------------------------------------------------------------

    setSelfPetCtrlAimIdx(selfBPet: BtlPet, toSelf: boolean, aimIdx: number) {
        if (toSelf) {
            if (selfBPet.ctrlSelfAimIdx === aimIdx) selfBPet.ctrlSelfAimIdx = -1;
            else selfBPet.ctrlSelfAimIdx = aimIdx;
            if (this.page) this.page.setSelfAim(selfBPet.idx, toSelf, selfBPet.ctrlSelfAimIdx);
        } else {
            if (selfBPet.ctrlEnemyAimIdx === aimIdx) selfBPet.ctrlEnemyAimIdx = -1;
            else selfBPet.ctrlEnemyAimIdx = aimIdx;
            if (this.page) this.page.setSelfAim(selfBPet.idx, toSelf, selfBPet.ctrlEnemyAimIdx);
        }
    }

    switchSelfPetForbidSkl(selfBPet: BtlPet, sklIdx: number): boolean {
        if (sklIdx >= 0) {
            const curIsForbid = ((selfBPet.sklForbidFlag >> sklIdx) & 1) === 1;
            if (curIsForbid) selfBPet.sklForbidFlag = selfBPet.sklForbidFlag & ~(1 << sklIdx);
            else selfBPet.sklForbidFlag = selfBPet.sklForbidFlag | (1 << sklIdx);

            if (this.page) {
                const flag = selfBPet.sklForbidFlag;
                const fbd1 = ((flag >> 0) & 1) === 1;
                const fbd2 = ((flag >> 1) & 1) === 1;
                const fbd3 = ((flag >> 2) & 1) === 1;
                const fbd4 = ((flag >> 3) & 1) === 1;
                this.page.setSelfSklForbid(selfBPet.idx, fbd1, fbd2, fbd3, fbd4);
            }
            return !curIsForbid;
        } else {
            selfBPet.sklForbidFlag = 0;
            if (this.page) this.page.setSelfSklForbid(selfBPet.idx, false, false, false, false);
            return false;
        }
    }

    // -----------------------------------------------------------------

    logAtk(btlPet: BtlPet, aim: BtlPet, dmg: number, skillName: string, eleType?: EleType) {
        const dataList = [PetTool.getCnName(btlPet.pet), PetTool.getCnName(aim.pet), skillName, Math.floor(dmg * 0.1), eleType];
        this.updater.log(ExplLogType.atk, dataList);
    }

    logMiss(btlPet: BtlPet, aim: BtlPet, skillName: string) {
        const dataList = [PetTool.getCnName(btlPet.pet), PetTool.getCnName(aim.pet), skillName];
        this.updater.log(ExplLogType.miss, dataList);
    }

    logBuff(aim: BtlPet, buffName: string, caster: BtlPet, src: string) {
        const dataList = [PetTool.getCnName(aim.pet), buffName, PetTool.getCnName(caster.pet), src];
        this.updater.log(ExplLogType.buff, dataList);
    }

    logBuffHurt(aim: BtlPet, dmg: number) {
        const dataList = [PetTool.getCnName(aim.pet), Math.floor(dmg * 0.1)];
        this.updater.log(ExplLogType.buffHurt, dataList);
    }

    logStop(btlPet: BtlPet) {
        this.updater.log(ExplLogType.stop, PetTool.getCnName(btlPet.pet));
    }

    logDead(btlPet: BtlPet) {
        this.updater.log(ExplLogType.dead, PetTool.getCnName(btlPet.pet));
    }

    ranSd() {
        return ranSd();
    }
}
