/*
 * PageActExpl.ts
 * 探索页面
 * luleyan
 */

const { ccclass, property, executionOrder } = cc._decorator;
import { BtlPageBase } from 'scripts/BtlPageBase';
import { ExplUpdater, ExplLogData } from 'scripts/ExplUpdater';
import { PetUI } from './PetUI';
import { buffModelDict } from 'configs/BuffModelDict';
import { PageActExplLVD } from './PageActExplLVD';
import { ListView } from 'scripts/ListView';
import { ItemType, CnsumType, Catcher, EleColors, EleDarkColors } from 'scripts/DataSaved';
import { BuffModel, BuffType, ExplModel, StepTypesByMax, ExplStepNames, PAKey } from 'scripts/DataModel';
import { BattlePet, RageMax, BattlePetLenMax } from 'scripts/DataOther';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { PagePkgSelection } from 'pages/page_pkg_selection/scripts/PagePkgSelection';
import { PagePkg } from 'pages/page_pkg/scripts/PagePkg';
import { GameDataTool, PetTool } from 'scripts/Memory';
import { NavBar } from 'scripts/NavBar';

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
export class PageActExpl extends BtlPageBase {
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
    @property(cc.Button) btnHide: cc.Button = null;
    @property(cc.Button) btnEnter: cc.Button = null;

    @property(cc.Node) enterTipNode: cc.Node = null;
    @property(cc.Label) enterTipLbl1: cc.Label = null;
    @property(cc.Label) enterTipLbl2: cc.Label = null;

    @property(cc.Label)
    newLogTipLbl: cc.Label = null;

    lblBtnCatch: cc.Label = null;
    lblBtnHide: cc.Label = null;
    lblBtnEnter: cc.Label = null;

    listView: ListView = null;
    lvd: PageActExplLVD = null;

    updaterRetaining: boolean = false; // 虽然退出但保留updater

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lblBtnCatch = this.btnCatch.getComponentInChildren(cc.Label);
        this.lblBtnHide = this.btnHide.getComponentInChildren(cc.Label);
        this.lblBtnEnter = this.btnEnter.getComponentInChildren(cc.Label);

        this.btnCatch.node.on('click', this.onClickCatch, this);
        this.btnHide.node.on('click', this.onClickHide, this);
        this.btnEnter.node.on('click', this.onClickEnter, this);

        this.listView = this.getComponentInChildren(ListView);
        this.lvd = this.getComponent(PageActExplLVD);
        this.lvd.page = this;

        for (let index = 0; index < BattlePetLenMax; index++) {
            const y = BattleUnitYs[index];

            const selfPetNode = cc.instantiate(this.selfPetPrefab);
            selfPetNode.y = y;
            selfPetNode.parent = this.selfPetsLayer;
            this.selfPetUIs.push(selfPetNode.getComponent(PetUI));
            selfPetNode.active = false;

            const enemyPetNode = cc.instantiate(this.enemyPetPrefab);
            enemyPetNode.y = y;
            enemyPetNode.parent = this.enemyPetsLayer;
            this.enemyPetUIs.push(enemyPetNode.getComponent(PetUI));
            enemyPetNode.active = false;
        }

        for (let index = 0; index < 30; index++) {
            const dmgLblNode = cc.instantiate(this.dmgPrefab);
            dmgLblNode.parent = this.node;
            dmgLblNode.opacity = 0;
            this.dmgLbls.push(dmgLblNode.getComponent(cc.Label));
        }

        this.initPADExpl();
    }

    initPADExpl() {
        const gameData = this.ctrlr.memory.gameData;
        const posId = gameData.curPosId;
        GameDataTool.addPA(gameData, posId, PAKey.expl);
    }

    spcBtlId: number = 0;
    startStep: number = 0;

    setData(data: any) {
        if (data) {
            this.spcBtlId = data.spcBtlId || 0;
            this.startStep = data.startStep || 0;
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            this.ctrlr.popAlert('确定退出探索？', this.onClickBack.bind(this), '确定', '仅主人自己离开，留精灵继续战斗');
            return false;
        });

        const posId = this.ctrlr.memory.gameData.curPosId; // 精灵和主人pos不一致无法进入该page，因此此处可用主人pos
        const posName = actPosModelDict[posId].cnName;
        navBar.setTitle('探索' + posName);
    }

    onClickBack(key: number) {
        if (key === 1) this.ctrlr.popPage();
        else if (key === 2) {
            const gameData = this.ctrlr.memory.gameData;
            const pets = GameDataTool.getReadyPets(gameData);
            for (const pet of pets) {
                const prvty = PetTool.getRealPrvty(pet);
                if (prvty < 50) {
                    this.ctrlr.popToast(`精灵独立战斗要求所有精灵默契值至少50，\n但目前${PetTool.getCnName(pet)}未达到！`);
                    return;
                }
            }
            this.updaterRetaining = true;
            this.ctrlr.popPage();
        }
    }

    start() {
        if (CC_EDITOR) return;

        if (ExplUpdater.haveUpdaterInBG()) {
            this.updater = ExplUpdater.popUpdaterInBG();
            this.updater.runAt(this);
            this.updater.resetAllUI();
        } else {
            this.updater = new ExplUpdater();
            this.updater.init(this, this.spcBtlId, this.startStep);

            // 仅用于从setData到start传递数据，传输后直接clear
            this.spcBtlId = 0;
            this.startStep = 0;
        }

        this.preloadLVDData();
    }

    preloadLVDData() {
        for (const sPet of GameDataTool.getReadyPets(this.ctrlr.memory.gameData)) {
            this.lvd.getFrameDataByString(PetTool.getCnName(sPet));
        }

        for (let index = 0; index <= 9; index++) {
            this.lvd.getFrameDataByString(String(index));
        }
    }

    update() {
        if (CC_EDITOR) return;
        this.updateLogListView();
    }

    beforePageHideAnim(willDestroy: boolean) {
        if (willDestroy) {
            if (!this.updaterRetaining) this.updater.destroy();
            else {
                this.updater.runAt(null);
                ExplUpdater.save(this.updater);
            }
        }
    }

    onPageShow() {
        this.setExplStepUI();
    }

    setExplStepUI() {
        if (this.ctrlr.getCurPage() !== this) return;

        const curExpl = this.ctrlr.memory.gameData.curExpl;
        if (!curExpl) return this.navBar.setSubTitle('');

        const posId = curExpl.curPosId;
        const curPosModel = actPosModelDict[posId];
        const explModel: ExplModel = curPosModel.actMDict[PAKey.expl] as ExplModel;

        const curStep = curExpl.curStep;
        const stepMax = explModel.stepMax;
        const stepType = StepTypesByMax[stepMax][curStep];
        const stepName = ExplStepNames[stepType];
        const percent = this.updater ? this.updater.explStepPercent : 0;
        let percentStr: string;
        if (percent >= 10) percentStr = '.' + String(percent);
        else if (percent > 0) percentStr = '.0' + String(percent);
        else percentStr = '';

        this.navBar.setSubTitle(`${stepName} ${curStep + 1}${percentStr}/${stepMax}`);
    }

    showEnterNextTip() {}

    // ui -----------------------------------------------------------------

    setUIofSelfPet(index: number) {
        const pets = this.updater.btlCtrlr.realBattle.selfTeam.pets;
        if (index === -1) {
            let petIdx = 0;
            for (; petIdx < pets.length; petIdx++) this.setUIofSelfPet(petIdx);
            for (; petIdx < BattlePetLenMax; petIdx++) this.clearUIofSelfPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.selfPetUIs[index]);
        }
    }

    setUIofEnemyPet(index: number) {
        const pets = this.updater.btlCtrlr.realBattle.enemyTeam.pets;
        if (index === -1) {
            for (let petIdx = 0; petIdx < pets.length; petIdx++) this.setUIofEnemyPet(petIdx);
        } else {
            this.setUIofPet(pets[index], this.enemyPetUIs[index]);
        }
    }

    setUIofPet(battlePet: BattlePet, ui: PetUI) {
        ui.node.active = true;
        const pet = battlePet.pet;
        ui.petName.string = PetTool.getCnName(pet);
        ui.subName.string = pet.nickname ? PetTool.getBaseCnName(pet) : '';
        ui.petLv.string = `L${pet.lv}`;
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
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];
        const node = ui.node;
        node.stopAllActions();
        cc.tween(node)
            .delay((combo - 1) * 0.05)
            .to(0.15, { x: beEnemy ? -35 : 35 })
            .to(0.15, { x: 0 })
            .start();
    }

    doHurt(beEnemy: boolean, idx: number, hp: number, hpMax: number, dmg: number, crit: boolean, combo: number) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];

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
        const dmgLbl = this.dmgLbls[this.dmgIdx];
        const params = DmgLblActParams[this.dmgIdx % 10];
        this.dmgIdx++;
        if (this.dmgIdx >= this.dmgLbls.length) this.dmgIdx = 0;

        dmgLbl.string = str;

        const node = dmgLbl.node;
        node.x = beEnemy ? 1080 - 25 - 435 : 25 + 435;
        node.y = BattleUnitYs[idx] - 68;
        node.scale = big ? 1.2 : 1;
        node.color = color;

        const dir = beEnemy ? 1 : -1;
        const p = cc.v2(params[0] * dir, 0);
        const h = 35 + params[1];

        node.stopAllActions();
        node.runAction(cc.sequence(cc.delayTime(delay), cc.jumpBy(1, p, h, 1).easing(cc.easeSineOut())));
        node.runAction(cc.sequence(cc.delayTime(delay), cc.fadeIn(0.01), cc.delayTime(0.7), cc.fadeOut(0.1)));
    }

    addBuff(beEnemy: boolean, idx: number, buffId: string, buffTime: number) {
        const buffModel = buffModelDict[buffId] as BuffModel;
        const buffBrief = buffModel.brief;
        const buffStr = buffBrief + String(buffTime);
        this.addBuffByStr(beEnemy, idx, buffStr, this.getBuffColor(buffModel));
    }

    getBuffColor(buffModel: BuffModel): cc.Color {
        if (buffModel.buffType === BuffType.buff) return EleColors[buffModel.eleType];
        else return EleDarkColors[buffModel.eleType];
    }

    addBuffByStr(beEnemy: boolean, idx: number, buffStr: string, color: cc.Color) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];

        const realBuffStr = '[' + buffStr + ']';
        const buffNode = cc.instantiate(this.buffPrefab);
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
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];
        const buffBrief = (buffModelDict[buffId] as BuffModel).brief;
        const buffStrTest = new RegExp('\\[' + buffBrief + '[0-9]*\\]');
        for (const child of ui.buffNode.children) {
            if (buffStrTest.test(child.getComponent(cc.Label).string)) {
                const newBuffStr = '[' + buffBrief + String(buffTime) + ']';
                child.getComponent(cc.Label).string = newBuffStr;
                break;
            }
        }
    }

    removeBuff(beEnemy: boolean, idx: number, buffId: string) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];
        if (buffId) {
            const buffBrief = (buffModelDict[buffId] as BuffModel).brief;
            const buffStrTest = new RegExp('\\[' + buffBrief + '[0-9]*\\]');
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
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];
        const buffStr = '[' + str + ']';
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
            const idxs = [];
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

    onClickHide() {
        this.updater.executeHide();
    }

    onClickEnter() {
        this.updater.executeEnter();
    }

    setCatchActive(b: boolean) {
        this.lblBtnCatch.string = b ? '捕捉中' : '捕捉';
    }

    setHideActive(b: boolean) {
        this.lblBtnHide.string = b ? '潜行中' : '潜行';
    }

    setEnterReady(b: boolean) {
        this.enterTipNode.stopAllActions();

        if (b) {
            this.lblBtnEnter.node.color = cc.Color.BLACK;
            cc.tween(this.enterTipNode).to(0.3, { opacity: 255 }).start();

            const curExpl = this.ctrlr.memory.gameData.curExpl;
            const curExplModel = actPosModelDict[curExpl.curPosId].actMDict[PAKey.expl] as ExplModel;
            const stepType = StepTypesByMax[curExplModel.stepMax][curExpl.curStep + 1] || 0;
            this.enterTipLbl1.string = actPosModelDict[curExpl.curPosId].cnName;
            this.enterTipLbl2.string = ExplStepNames[stepType];

            // @ts-ignore
            this.enterTipLbl1._assembler.updateRenderData(this.enterTipLbl1);
            // @ts-ignore
            this.enterTipLbl2._assembler.updateRenderData(this.enterTipLbl2);
            this.enterTipNode.getComponent(cc.Layout).updateLayout();
        } else {
            this.lblBtnEnter.node.color = cc.color(175, 175, 175);
            cc.tween(this.enterTipNode).to(0.3, { opacity: 0 }).start();
        }
    }

    // list -----------------------------------------------------------------

    logList: ExplLogData[] = [];

    autoShowLog: boolean = true;
    autoMoveDis: number = 0;

    getLogs(): ExplLogData[] {
        return this.logList;
    }

    handleLog() {
        const newLogCnt = this.updater.logList.length;
        if (newLogCnt === 0) return;
        if (this.autoShowLog) {
            for (const logData of this.updater.logList) this.logList[this.logList.length] = logData;
            this.updater.clearLogList();

            if (this.logList.length > 200) this.logList = this.logList.slice(100);

            const moveLogCnt = Math.min(newLogCnt, 10);
            this.listView.clearContent();
            this.listView.createContent(moveLogCnt * 70);
            this.autoMoveDis = moveLogCnt * 6;

            this.setNewLogTip(0);
        } else {
            this.setNewLogTip(newLogCnt);
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
            const newPos = this.listView.content.y - this.autoMoveDis;
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
        const area = this.newLogTipLbl.node.parent;
        area.stopAllActions();
        if (tipCount <= 0) {
            cc.tween(area).to(0.2, { opacity: 0 }).start();
        } else {
            cc.tween(area).to(0.2, { opacity: 255 }).start();
            this.newLogTipLbl.string = String(Math.min(tipCount, 99));
        }
    }
}
