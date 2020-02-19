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
import { BattlePet } from './BattleController';

const BattleUnitYs = [-60, -220, -380, -540, -700];

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

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        for (let index = 0; index < 5; index++) {
            let y = BattleUnitYs[index];

            let selfPetNode = cc.instantiate(this.selfPetPrefab);
            selfPetNode.y = y;
            selfPetNode.parent = this.selfPetsLayer;
            this.selfPetUIs.push(selfPetNode.getComponent(PetUI));

            let enemyPetNode = cc.instantiate(this.enemyPetPrefab);
            enemyPetNode.y = y;
            enemyPetNode.parent = this.enemyPetsLayer;
            this.enemyPetUIs.push(enemyPetNode.getComponent(PetUI));
        }

        this.updater = new ExplorationUpdater();
        this.updater.init(this);
    }

    onDestroy() {
        if (!CC_EDITOR) this.updater.destroy();
    }

    update() {
        if (!CC_EDITOR) this.updater.update();
    }

    onPageShow() {
        this.ctrlr.setBackBtnEnabled(true);
        this.ctrlr.setTitle('探索');
    }

    // ui -----------------------------------------------------------------

    setUIofSelfPet(index: number) {
        let pets = this.updater.battleCtrlr.realBattle.selfPets;
        if (index == -1) {
            for (let petIdx = 0; petIdx < pets.length; petIdx++) this.setUIofSelfPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.selfPetUIs[index]);
        }
    }

    setUIofEnemyPet(index: number) {
        let pets = this.updater.battleCtrlr.realBattle.enemyPets;
        if (index == -1) {
            for (let petIdx = 0; petIdx < pets.length; petIdx++) this.setUIofEnemyPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.enemyPetUIs[index]);
        }
    }

    setUIofPet(battlePet: BattlePet, ui: PetUI) {
        let pet = battlePet.pet;
        let petModel = this.ctrlr.memory.petModelDict[pet.id];
        ui.petName.string = petModel.cnName;
        ui.petLv.string = `L${pet.level}${PetRankNames[pet.rank]}`;
        ui.bar.progress = battlePet.hp / battlePet.pet2.hpMax;
        ui.petHP.string = `${Math.ceil(battlePet.hp * 0.1)} / ${Math.ceil(battlePet.pet2.hpMax * 0.1)}`;
    }

    log(str: string) {
        cc.log('PUT EXPL: ', str);
    }
}
