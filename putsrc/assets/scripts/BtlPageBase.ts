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
    abstract setSelfSklForbid(selfIdx: number, sklIdx: number): void;

    abstract doAttack(beEnemy: boolean, idx: number, combo: number): void;
    abstract doHurt(beEnemy: boolean, idx: number, hp: number, hpMax: number, dmg: number, crit: boolean, combo: number): void;
    abstract doMiss(beEnemy: boolean, idx: number, combo: number): void;

    abstract addBuff(beEnemy: boolean, idx: number, buffId: string, buffTime: number): void;
    abstract addBuffByStr(beEnemy: boolean, idx: number, buffStr: string, color: cc.Color): void;
    abstract resetBuffTime(beEnemy: boolean, idx: number, buffId: string, buffTime: number): void;
    abstract removeBuff(beEnemy: boolean, idx: number, buffId: string): void;
    abstract removeBuffByStr(beEnemy: boolean, idx: number, str: string): void;

    abstract resetAttriBar(mp: number, mpMax: number, rage: number): void;

    abstract setCatchActive(b: boolean): void;
    abstract setHideActive(b: boolean): void;
    abstract setEnterReady(b: boolean): void;

    abstract handleLog(): void;
    abstract setExplStepUI(): void;
}
