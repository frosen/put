/*
 * PageActExpl.ts
 * 探索页面
 * luleyan
 */

const { ccclass, property, executionOrder } = cc._decorator;
import { BattlePageBase } from 'scripts/BattlePageBase';
import { ExplUpdater, ExplLogData } from 'scripts/ExplUpdater';
import { PetUI } from './PetUI';
import { petModelDict } from 'configs/PetModelDict';
import { buffModelDict } from 'configs/BuffModelDict';
import { PageActExplLVD } from './PageActExplLVD';
import { ListView } from 'scripts/ListView';
import { PetRankNames, EleType, Pet, ItemType, CnsumType, Catcher } from 'scripts/DataSaved';
import { BuffModel, BuffType, ExplModel, StepTypesByMax, ExplStepNames, APAKey } from 'scripts/DataModel';
import { BattlePet, RageMax, BattlePetLenMax } from 'scripts/DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { PagePkgSelection } from 'pages/page_pkg_selection/scripts/PagePkgSelection';
import { PagePkg } from 'pages/page_pkg/scripts/PagePkg';
import { MmrTool, PosMmrTool, GameDataTool } from 'scripts/Memory';

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
@executionOrder(1) // 为了start在scrollview的start之后进行，保证对scrollview的content.y设置正确
export class PageActExpl extends BattlePageBase {
    updater: ExplUpdater = null;

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

    @property(cc.ProgressBar) mpProgress: cc.ProgressBar = null;
    @property(cc.Label) mpLbl: cc.Label = null;

    @property(cc.ProgressBar) rageProgress: cc.ProgressBar = null;
    @property(cc.Label) rageLbl: cc.Label = null;

    @property(cc.Button) btnCatch: cc.Button = null;
    @property(cc.Button) btnEscape: cc.Button = null;
    @property(cc.Button) btnHide: cc.Button = null;

    @property(cc.Label)
    newLogTipLbl: cc.Label = null;

    lblBtnCatch: cc.Label = null;
    lblBtnEscape: cc.Label = null;
    lblBtnHide: cc.Label = null;

    listView: ListView = null;
    lvd: PageActExplLVD = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lblBtnCatch = this.btnCatch.getComponentInChildren(cc.Label);
        this.lblBtnEscape = this.btnEscape.getComponentInChildren(cc.Label);
        this.lblBtnHide = this.btnHide.getComponentInChildren(cc.Label);

        this.btnCatch.node.on('click', this.onClickCatch, this);
        this.btnEscape.node.on('click', this.onClickEscape, this);
        this.btnHide.node.on('click', this.onClickHide, this);

        this.listView = this.getComponentInChildren(ListView);
        this.lvd = this.getComponent(PageActExplLVD);
        this.lvd.page = this;

        for (let index = 0; index < BattlePetLenMax; index++) {
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

        this.updater = new ExplUpdater();
        this.initLVD();

        this.initExplMmr();
    }

    initLVD() {
        let selfPets = this.ctrlr.memory.gameData.pets;
        for (const sPet of selfPets) {
            let name = petModelDict[sPet.id].cnName;
            this.lvd.getFrameDataByString(name);
        }

        let curExpl = this.ctrlr.memory.gameData.curExpl;
        let ePetIdLists = actPosModelDict[curExpl.curPosId].petIdLists;
        for (const ePetIdList of ePetIdLists) {
            if (!ePetIdList) continue;
            for (const ePetId of ePetIdList) {
                let name = petModelDict[ePetId].cnName;
                this.lvd.getFrameDataByString(name);
            }
        }
    }

    initExplMmr() {
        let gameData = this.ctrlr.memory.gameData;
        let posId = gameData.curPosId;
        GameDataTool.addPosAct(gameData, posId, APAKey.expl);
    }

    spcBtlId: number = 0;
    startStep: number = 0;

    setData(data: any) {
        if (data) {
            this.spcBtlId = data.spcBtlId || 0;
            this.startStep = data.startStep || 0;
        }
    }

    start() {
        if (CC_EDITOR) return;
        this.updater.init(this, this.spcBtlId, this.startStep);
    }

    update() {
        if (CC_EDITOR) return;
        this.updateLogListView();
    }

    beforePageHideAnim(willDestroy: boolean) {
        if (willDestroy) this.updater.destroy();
    }

    onPageShow() {
        this.ctrlr.setBackBtnEnabled(true, (): boolean => {
            this.ctrlr.popAlert('确定退出探索？', (key: number) => {
                if (key === 1) this.ctrlr.popPage();
            });
            return false;
        });

        let posId = this.ctrlr.memory.gameData.curPosId; // 宠物和主人pos不一致无法进入该page，因此此处可用主人pos
        let posName = actPosModelDict[posId].cnName;
        this.ctrlr.setTitle('探索' + posName);
        this.setExplStepUI();
    }

    setExplStepUI() {
        if (this.ctrlr.getCurPage() !== this) return;

        let curExpl = this.ctrlr.memory.gameData.curExpl;
        if (!curExpl) return this.ctrlr.setSubTitle('');

        let posId = curExpl.curPosId;
        let curPosModel = actPosModelDict[posId];
        let explModel: ExplModel = curPosModel.actDict[APAKey.expl] as ExplModel;

        let stepMax = explModel.stepMax;
        let step = Math.min(MmrTool.getCurStep(curExpl), stepMax - 1);
        let stepType = StepTypesByMax[stepMax][step];
        let stepName = ExplStepNames[stepType];
        let percent = this.updater.explStepPercent;
        let percentStr: string;
        if (percent >= 10) percentStr = '.' + String(percent);
        else if (percent > 0) percentStr = '.0' + String(percent);
        else percentStr = '';

        this.ctrlr.setSubTitle(`${stepName} ${step + 1}${percentStr}/${stepMax}`);
    }

    // ui -----------------------------------------------------------------

    setUIofSelfPet(index: number) {
        let pets = this.updater.battleCtrlr.realBattle.selfTeam.pets;
        if (index === -1) {
            let petIdx = 0;
            for (; petIdx < pets.length; petIdx++) this.setUIofSelfPet(petIdx);
            for (; petIdx < BattlePetLenMax; petIdx++) this.clearUIofSelfPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.selfPetUIs[index]);
        }
    }

    setUIofEnemyPet(index: number) {
        let pets = this.updater.battleCtrlr.realBattle.enemyTeam.pets;
        if (index === -1) {
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

        if (combo > 0) {
            let dmgStr = String(Math.floor(dmg * 0.1 * -1));
            if (crit) dmgStr += '!';
            this.showLbl(dmgStr, beEnemy, idx, crit, 0.1 * (combo - 1), dmg > 0 ? cc.Color.RED : cc.Color.GREEN);
        }
    }

    doMiss(beEnemy: boolean, idx: number, combo: number) {
        this.showLbl('miss', beEnemy, idx, false, 0.1 * (combo - 1), cc.Color.RED);
    }

    showLbl(str: string, beEnemy: boolean, idx: number, big: boolean, delay: number, color: cc.Color) {
        let dmgLbl = this.dmgLbls[this.dmgIdx];
        let params = DmgLblActParams[this.dmgIdx % 10];
        this.dmgIdx++;
        if (this.dmgIdx >= this.dmgLbls.length) this.dmgIdx = 0;

        dmgLbl.string = str;

        let node = dmgLbl.node;
        node.x = beEnemy ? 1080 - 25 - 435 : 25 + 435;
        node.y = BattleUnitYs[idx] - 68;
        node.scale = big ? 1.2 : 1;
        node.color = color;

        let dir = beEnemy ? 1 : -1;
        let p = cc.v2(params[0] * dir, 0);
        let h = 35 + params[1];

        node.stopAllActions();
        node.runAction(cc.sequence(cc.delayTime(delay), cc.jumpBy(1, p, h, 1).easing(cc.easeSineOut())));
        node.runAction(cc.sequence(cc.delayTime(delay), cc.fadeIn(0.01), cc.delayTime(0.7), cc.fadeOut(0.1)));
    }

    addBuff(beEnemy: boolean, idx: number, buffId: string, buffTime: number) {
        let buffModel = buffModelDict[buffId] as BuffModel;
        let buffBrief = buffModel.brief;
        let buffStr = buffBrief + String(buffTime);
        this.addBuffByStr(beEnemy, idx, buffStr, this.getBuffColor(buffModel));
    }

    getBuffColor(buffModel: BuffModel): cc.Color {
        let de = buffModel.buffType === BuffType.debuff;
        switch (buffModel.eleType) {
            case EleType.fire:
                return de ? cc.color(200, 0, 0) : cc.color(255, 100, 100);
            case EleType.water:
                return de ? cc.color(0, 0, 200) : cc.color(100, 100, 255);
            case EleType.air:
                return de ? cc.color(0, 175, 0) : cc.color(50, 230, 50);
            case EleType.earth:
                return de ? cc.color(100, 90, 50) : cc.color(168, 150, 85);
            case EleType.light:
                return de ? cc.color(239, 115, 0) : cc.color(239, 200, 0);
            case EleType.dark:
                return de ? cc.color(125, 0, 195) : cc.color(185, 78, 255);
        }
    }

    addBuffByStr(beEnemy: boolean, idx: number, buffStr: string, color: cc.Color) {
        let uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        let ui = uis[idx];

        let realBuffStr = '[' + buffStr + ']';
        let buffNode = cc.instantiate(this.buffPrefab);
        buffNode.getComponent(cc.Label).string = realBuffStr;
        buffNode.color = color;
        buffNode.parent = ui.buffNode;

        // 多于7个后面不显示
        for (let index = 0; index < ui.buffNode.childrenCount; index++) {
            const buff = ui.buffNode.children[index];
            buff.scale = index < 7 ? 1 : 0;
        }
    }

    resetBuffTime(beEnemy: boolean, idx: number, buffId: string, buffTime: number) {
        let uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        let ui = uis[idx];
        let buffBrief = (buffModelDict[buffId] as BuffModel).brief;
        let buffStrTest = new RegExp('\\[' + buffBrief + '[0-9]*\\]');
        for (const child of ui.buffNode.children) {
            if (buffStrTest.test(child.getComponent(cc.Label).string)) {
                let newBuffStr = '[' + buffBrief + String(buffTime) + ']';
                child.getComponent(cc.Label).string = newBuffStr;
                break;
            }
        }
    }

    removeBuff(beEnemy: boolean, idx: number, buffId: string) {
        let uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        let ui = uis[idx];
        if (buffId) {
            let buffBrief = (buffModelDict[buffId] as BuffModel).brief;
            let buffStrTest = new RegExp('\\[' + buffBrief + '[0-9]*\\]');
            for (const child of ui.buffNode.children) {
                if (buffStrTest.test(child.getComponent(cc.Label).string)) {
                    child.removeFromParent();
                    child.destroy();
                    break;
                }
            }

            // 多于7个后面不显示
            for (let index = 0; index < ui.buffNode.childrenCount; index++) {
                const buff = ui.buffNode.children[index];
                buff.scale = index < 7 ? 1 : 0;
            }
        } else {
            for (const child of ui.buffNode.children) child.destroy();
            ui.buffNode.removeAllChildren();
        }
    }

    removeBuffByStr(beEnemy: boolean, idx: number, str: string) {
        let uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        let ui = uis[idx];
        let buffStr = '[' + str + ']';
        for (const child of ui.buffNode.children) {
            if (child.getComponent(cc.Label).string === buffStr) {
                child.removeFromParent();
                child.destroy();
                break;
            }
        }
    }

    resetAttriBar(mp: number, mpMax: number, rage: number) {
        this.mpProgress.progress = mp / mpMax;
        this.mpLbl.string = `${mp} / ${mpMax}`;

        this.rageProgress.progress = rage / RageMax;
        this.rageLbl.string = `${rage} / ${RageMax}`;
    }

    // button -----------------------------------------------------------------

    onClickCatch() {
        if (!this.ctrlr.memory.gameData.curExpl.catcherId) {
            let idxs = [];
            PagePkg.getoutItemIdxsByType(this.ctrlr.memory.gameData.items, idxs, ItemType.cnsum, CnsumType.catcher);
            this.ctrlr.pushPage(PagePkgSelection, {
                name: '选择捕捉器',
                curItemIdxs: idxs,
                callback: (index: number, itemIdx: number, catcher: Catcher) => {
                    this.ctrlr.memory.gameData.curExpl.catcherId = catcher.id;
                    this.setCatchActive(true);
                    this.ctrlr.popPage();
                }
            });
        } else {
            this.ctrlr.memory.gameData.curExpl.catcherId = null;
            this.setCatchActive(false);
        }
    }

    onClickEscape() {
        this.updater.executeEscape();
    }

    onClickHide() {
        this.updater.executeHide();
    }

    setCatchActive(b: boolean) {
        this.lblBtnCatch.string = b ? '捕捉中' : '捕捉';
    }

    setHideActive(b: boolean) {
        this.lblBtnHide.string = b ? '潜行中' : '潜行';
    }

    // list -----------------------------------------------------------------

    autoShowLog: boolean = true;
    autoMoveDis: number = 0;

    getLogs(): ExplLogData[] {
        return this.updater.logList;
    }

    handleLog() {
        let newLogCount = this.updater.newLogCount;
        if (newLogCount === 0) return;
        if (this.autoShowLog) {
            let logCount = Math.min(newLogCount, 10);
            this.listView.clearContent();
            this.listView.createContent(logCount * 70);
            this.autoMoveDis = logCount * 6;
            this.updater.clearNewLogCount();
            this.setNewLogTip(0);
        } else {
            this.setNewLogTip(newLogCount);
        }
    }

    updateLogListView() {
        if (this.autoShowLog) {
            if (this.listView.touching) {
                this.autoShowLog = false;
                this.autoMoveDis = 0;
            }
        } else {
            if (!this.listView.touching && this.listView.content.y <= 1) this.autoShowLog = true;
        }

        if (this.autoShowLog && this.autoMoveDis > 0) {
            let newPos = this.listView.content.y - this.autoMoveDis;
            if (newPos > 0) {
                this.listView.content.y = newPos;
            } else {
                this.listView.content.y = 0;
                this.autoMoveDis = 0;
            }
            this.listView.onScrolling();
        }
    }

    setNewLogTip(tipCount: number) {
        let area = this.newLogTipLbl.node.parent;
        area.stopAllActions();
        if (tipCount <= 0) {
            cc.tween(area).to(0.2, { opacity: 0 }).start();
        } else {
            cc.tween(area).to(0.2, { opacity: 255 }).start();
            this.newLogTipLbl.string = String(Math.min(tipCount, 99));
        }
    }
}
