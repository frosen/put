/*
 * BattlePageBase.ts
 * 可以使用BattleController和ExplUpdater的页面的基类
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { PageBase } from './PageBase';

@ccclass
export abstract class BattlePageBase extends PageBase {
    abstract setUIofSelfPet(index: number): void;
    abstract setUIofEnemyPet(index: number): void;
    abstract clearUIofSelfPet(index: number): void;
    abstract clearUIofEnemyPet(index: number): void;

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

    abstract handleLog(): void;

    abstract setExplStepUI(): void;
    abstract showEnterNextTip(): void;
}
