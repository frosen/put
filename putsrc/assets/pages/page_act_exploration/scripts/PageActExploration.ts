/*
 * PageActExploration.ts
 * 探索页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import PageBase from 'scripts/PageBase';
import ExplorationUpdater from './ExplorationUpdater';
import PetUI from './PetUI';
import { PetRankNames } from 'scripts/Memory';
import * as petModelDict from 'configs/PetModelDict';
import { BattlePet } from './BattleController';

const BattleUnitYs = [-60, -220, -380, -540, -700];

const DmgLblActParams: number[][] = [
    [97, 30],
    [39, 50],
    [126, 10],
    [68, 30],
    [10, 50],
    [97, 10],
    [39, 30],
    [126, 50],
    [68, 10],
    [10, 60]
];

@ccclass
export default class PageActExploration extends PageBase {
    updater: ExplorationUpdater = null;

    @property(cc.Node)
    selfPetsLayer: cc.Node = null;

    @property(cc.Node)
    enemyPetsLayer: cc.Node = null;

    @property(cc.Prefab)
    selfPetPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    enemyPetPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    buffPrefab: cc.Prefab = null;

    selfPetUIs: PetUI[] = [];
    enemyPetUIs: PetUI[] = [];

    @property(cc.Prefab)
    dmgPrefab: cc.Prefab = null;

    dmgLbls: cc.Label[] = [];
    dmgIdx: number = 0;

    @property(cc.ProgressBar)
    mpProgress: cc.ProgressBar = null;
    @property(cc.Label)
    mpLbl: cc.Label = null;
    @property(cc.ProgressBar)
    rageProgress: cc.ProgressBar = null;
    @property(cc.Label)
    rageLbl: cc.Label = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        for (let index = 0; index < 5; index++) {
            let y = BattleUnitYs[index];

            let selfPetNode = cc.instantiate(this.selfPetPrefab);
            selfPetNode.y = y;
            selfPetNode.parent = this.selfPetsLayer;
            this.selfPetUIs.push(selfPetNode.getComponent(PetUI));
            selfPetNode.active = false;

            let enemyPetNode = cc.instantiate(this.enemyPetPrefab);
            enemyPetNode.y = y;
            enemyPetNode.parent = this.enemyPetsLayer;
            this.enemyPetUIs.push(enemyPetNode.getComponent(PetUI));
            enemyPetNode.active = false;
        }

        for (let index = 0; index < 30; index++) {
            let dmgLblNode = cc.instantiate(this.dmgPrefab);
            dmgLblNode.parent = this.node;
            dmgLblNode.opacity = 0;
            this.dmgLbls.push(dmgLblNode.getComponent(cc.Label));
        }

        this.updater = new ExplorationUpdater();
        this.updater.init(this);
    }

    onDestroy() {
        if (!CC_EDITOR) this.updater.destroy();
    }

    onPageShow() {
        this.ctrlr.setBackBtnEnabled(true);
        this.ctrlr.setTitle('探索');
    }

    // ui -----------------------------------------------------------------

    setUIofSelfPet(index: number) {
        let pets = this.updater.battleCtrlr.realBattle.selfTeam.pets;
        if (index == -1) {
            let petIdx = 0;
            for (; petIdx < pets.length; petIdx++) this.setUIofSelfPet(petIdx);
            for (; petIdx < 5; petIdx++) this.clearUIofSelfPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.selfPetUIs[index]);
        }
    }

    setUIofEnemyPet(index: number) {
        let pets = this.updater.battleCtrlr.realBattle.enemyTeam.pets;
        if (index == -1) {
            for (let petIdx = 0; petIdx < pets.length; petIdx++) this.setUIofEnemyPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.enemyPetUIs[index]);
        }
    }

    setUIofPet(battlePet: BattlePet, ui: PetUI) {
        ui.node.active = true;
        let pet = battlePet.pet;
        let petModel = petModelDict[pet.id];
        ui.petName.string = petModel.cnName;
        ui.petLv.string = `L${pet.lv}${PetRankNames[pet.rank]}`;
        ui.bar.progress = battlePet.hp / battlePet.hpMax;
        ui.petHP.string = `${Math.ceil(battlePet.hp * 0.1)} / ${Math.ceil(battlePet.hpMax * 0.1)}`;
        ui.node.stopAllActions();
        ui.node.x = 0;
    }

    clearUIofSelfPet(index: number) {
        this.selfPetUIs[index].node.active = false;
    }

    clearUIofEnemyPet(index: number) {
        this.enemyPetUIs[index].node.active = false;
    }

    doAttack(beEnemy: boolean, idx: number, combo: number) {
        let uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        let ui = uis[idx];
        let node = ui.node;
        node.stopAllActions();
        cc.tween(node)
            .delay((combo - 1) * 0.05)
            .to(0.15, { x: beEnemy ? -35 : 35 })
            .to(0.15, { x: 0 })
            .start();
    }

    doHurt(beEnemy: boolean, idx: number, hp: number, hpMax: number, dmg: number, crit: boolean, combo: number) {
        let uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        let ui = uis[idx];

        ui.bar.progress = hp / hpMax;
        ui.petHP.string = `${Math.ceil(hp * 0.1)} / ${Math.ceil(hpMax * 0.1)}`;

        let dmgStr = String(Math.floor(dmg * 0.1 * -1));
        if (crit) dmgStr += '!';
        this.showLbl(dmgStr, beEnemy, idx, crit, combo);
    }

    doMiss(beEnemy: boolean, idx: number, combo: number) {
        this.showLbl('miss', beEnemy, idx, false, combo);
    }

    showLbl(str: string, beEnemy: boolean, idx: number, crit: boolean, combo: number) {
        let dmgLbl = this.dmgLbls[this.dmgIdx];
        let params = DmgLblActParams[this.dmgIdx % 10];
        this.dmgIdx++;
        if (this.dmgIdx >= this.dmgLbls.length) this.dmgIdx = 0;

        dmgLbl.string = str;

        let node = dmgLbl.node;
        node.x = beEnemy ? 1080 - 25 - 435 : 25 + 435;
        node.y = BattleUnitYs[idx] - 68;
        node.scale = crit ? 1.2 : 1;

        let dir = beEnemy ? 1 : -1;
        let p = cc.v2(params[0] * dir, 0);
        let h = 35 + params[1];

        node.stopAllActions();
        node.runAction(cc.sequence(cc.delayTime(0.1 * (combo - 1)), cc.jumpBy(1, p, h, 1).easing(cc.easeSineOut())));
        node.runAction(cc.sequence(cc.delayTime(0.1 * (combo - 1)), cc.fadeIn(0.01), cc.delayTime(0.7), cc.fadeOut(0.1)));
    }

    resetCenterBar(mp: number, mpMax: number, rage: number) {
        this.mpProgress.progress = mp / mpMax;
        this.mpLbl.string = `${mp} / ${mpMax}`;

        this.rageProgress.progress = rage / 100;
        this.rageLbl.string = `${rage} / 100`;
    }

    log(str: string) {
        cc.log('PUT EXPL: ', str);
    }
}
