/*
 * BtlPageBase.ts
 * 可以使用BtlCtrlr和ExplUpdater的页面的基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from './PageBase';

@ccclass
export abstract class BtlPageBase extends PageBase {
    abstract setUIOfSelfPet(idx: number): void;
    abstract setUIOfEnemyPet(idx: number): void;
    abstract clearUIOfSelfPet(idx: number): void;
    abstract clearUIOfEnemyPet(idx: number): void;

    abstract setSelfAim(selfIdx: number, toSelf: boolean, aimIndex: number): void;
    abstract setSelfSklForbid(selfIdx: number, fbd1: boolean, fbd2: boolean, fbd3: boolean, fbd4: boolean): void;

    abstract doAttack(beEnemy: boolean, idx: number, combo: number): void;
    abstract doHurt(beEnemy: boolean, idx: number, hp: number, hpMax: number, dmg: number, crit: boolean, combo: number): void;
    abstract doMiss(beEnemy: boolean, idx: number, combo: number): void;

    abstract addBuff(beEnemy: boolean, petIdx: number, buffId: string, buffTime: number, buffIdx: number): void;
    abstract resetBuffTime(beEnemy: boolean, petIdx: number, buffId: string, buffTime: number, buffIdx: number): void;
    abstract removeBuff(beEnemy: boolean, petIdx: number, buffIdx: number): void;

    abstract resetAttriBar(mp: number, mpMax: number, rage: number): void;

    abstract setCatchActive(b: boolean): void;
    abstract setHideActive(b: boolean): void;
    abstract setEnterReady(b: boolean): void;

    abstract handleLog(): void;
    abstract setExplStepUI(): void;
}
