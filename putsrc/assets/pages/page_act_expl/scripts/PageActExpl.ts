/*
 * PageActExpl.ts
 * 探索页面
 * luleyan
 */

const { ccclass, property, executionOrder } = cc._decorator;
import { BtlPageBase } from '../../../scripts/BtlPageBase';
import { ExplUpdater, ExplLogData, ExplState } from '../../../scripts/ExplUpdater';
import { ItemType, CnsumType, Catcher, EleColors, EleDarkColors, BattleType } from '../../../scripts/DataSaved';
import { BuffModel, BuffType, ExplModel, StepTypesByMax, ExplStepNames } from '../../../scripts/DataModel';
import { BattlePet, RageMax, BattlePetLenMax, BossMaster } from '../../../scripts/DataOther';
import { ListView } from '../../../scripts/ListView';
import { GameDataTool, PetTool } from '../../../scripts/Memory';
import { NavBar } from '../../../scripts/NavBar';

import { buffModelDict } from '../../../configs/BuffModelDict';
import { actPosModelDict, PAKey } from '../../../configs/ActPosModelDict';

import { PetUI } from './PetUI';
import { AimLine, LineType } from './AimLine';
import { SklForbidBtnLayer, SklForbidBtnState } from './SklForbidBtnLayer';
import { EnemyDetail } from './EnemyDetail';
import { PageActExplLVD } from './PageActExplLVD';

import { PagePkgSelection } from '../../page_pkg_selection/scripts/PagePkgSelection';
import { PagePkg } from '../../page_pkg/scripts/PagePkg';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { TouchLayerForBack } from '../../../scripts/TouchLayerForBack';
import { PTN } from '../../../configs/ProTtlModelDict';
import { BtlCtrlr } from '../../../scripts/BtlCtrlr';
import { skillModelDict } from '../../../configs/SkillModelDict';

const btlUnitH = -172;
const BattleUnitYs = [0, btlUnitH, btlUnitH * 2, btlUnitH * 3, btlUnitH * 4];

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

const ForbidBtnPosss: cc.Vec2[][] = [
    null,
    [cc.v2(-100, 0)],
    [cc.v2(-80, 25), cc.v2(-80, -25)],
    [cc.v2(30, 80), cc.v2(0, -100), cc.v2(-30, 80)],
    [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0, 0), cc.v2(0, 0)]
];

@ccclass
@executionOrder(1) // 为了start在scrollview的start之后进行，保证对scrollview的content.y设置正确
export class PageActExpl extends BtlPageBase {
    updater: ExplUpdater = null;

    @property(cc.Node)
    selfPetsLayer: cc.Node = null;

    @property(cc.Node)
    enemyPetsLayer: cc.Node = null;

    @property(cc.Node)
    dmgLayer: cc.Node = null;

    @property(cc.Node)
    btlTouchLayer: cc.Node = null;

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

    @property(cc.Prefab)
    aimLinePrefab: cc.Prefab = null;

    aimLiness: AimLine[][] = [];

    @property(cc.Prefab)
    sklForbidBtnLayerPrefab: cc.Prefab = null;

    sklForbidBtnLayer: SklForbidBtnLayer = null;

    @property(cc.Prefab)
    enemyDetailPrefab: cc.Prefab = null;

    enemyDetail: EnemyDetail = null;

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

    lblBtnCatch: cc.Label;
    lblBtnHide: cc.Label;
    lblBtnEnter: cc.Label;

    listView: ListView;
    lvd: PageActExplLVD;

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
            dmgLblNode.parent = this.dmgLayer;
            dmgLblNode.opacity = 0;
            this.dmgLbls.push(dmgLblNode.getComponent(cc.Label));
        }

        this.initTouchCtrl();
        this.initPADExpl();
    }

    initTouchCtrl() {
        this.btlTouchLayer.on(cc.Node.EventType.TOUCH_START, this.onBtlTouchStart.bind(this));
        this.btlTouchLayer.on(cc.Node.EventType.TOUCH_MOVE, this.onBtlTouchMove.bind(this));
        this.btlTouchLayer.on(cc.Node.EventType.TOUCH_END, this.onBtlTouchEnd.bind(this));
        this.btlTouchLayer.on(cc.Node.EventType.TOUCH_CANCEL, this.onBtlTouchEnd.bind(this));

        const gameData = this.ctrlr.memory.gameData;
        this.canCtrlSelfAim = GameDataTool.hasProTtl(gameData, PTN.ZhanShuDaShi);
        this.canCtrlSelfSkl = GameDataTool.hasProTtl(gameData, PTN.YiLingZhe);
        this.canSeeEnemy = GameDataTool.hasProTtl(gameData, PTN.YingYan);

        // 层级上，sklForbidBtnLayer在aimLine下面
        if (this.canCtrlSelfSkl) {
            const layer = cc.instantiate(this.sklForbidBtnLayerPrefab);
            layer.parent = this.btlTouchLayer;
            layer.setPosition(540, -this.btlTouchLayer.height - layer.height);
            layer.opacity = 0;
            this.sklForbidBtnLayer = layer.getComponent(SklForbidBtnLayer);
        }

        if (this.canCtrlSelfAim) {
            const createAimLine = (lt: LineType): AimLine => {
                const lineNode = cc.instantiate(this.aimLinePrefab);
                lineNode.parent = this.btlTouchLayer;
                const line = lineNode.getComponent(AimLine);
                line.setLineType(lt);
                line.hide();
                return line;
            };

            for (let index = 0; index < BattlePetLenMax; index++) {
                const lines = [];
                lines.push(createAimLine(LineType.toSelf));
                lines.push(createAimLine(LineType.toEnemy));
                lines.push(createAimLine(LineType.normal));
                this.aimLiness.push(lines);
            }
        }

        if (this.canSeeEnemy) {
            const node = cc.instantiate(this.enemyDetailPrefab);
            node.parent = this.btlTouchLayer;
            this.enemyDetail = node.getComponent(EnemyDetail);
            this.enemyDetail.hide();
        }
    }

    initPADExpl() {
        const gameData = this.ctrlr.memory.gameData;
        const posId = gameData.curPosId;
        GameDataTool.addPA(gameData, posId, PAKey.expl);
    }

    spcBtlId: string = '';
    startStep: number = 0;

    setData(data: any) {
        if (data) {
            this.spcBtlId = data.spcBtlId || '';
            this.startStep = data.startStep || 0;
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true, (): boolean => {
            this.ctrlr.popAlert('确定退出探索？', this.onClickBack.bind(this), '确定', '仅训练师自己离开，留精灵继续战斗');
            return false;
        });

        const posId = this.ctrlr.memory.gameData.curPosId;
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
                if (prvty < 35) {
                    this.ctrlr.popToast(`精灵独立战斗要求所有精灵默契值至少35，\n但目前${PetTool.getCnName(pet)}未达到！`);
                    return;
                }
            }
            this.updaterRetaining = true;
            gameData.curExpl.afb = true;

            this.ctrlr.popPage();
        }
    }

    start() {
        if (CC_EDITOR) return;

        const gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl && gameData.curExpl.afb && ExplUpdater.haveUpdaterInBG()) {
            this.updater = ExplUpdater.popUpdaterInBG();
            this.updater.runAt(this);
            this.updater.resetAllUI();

            gameData.curExpl.afb = false;
        } else {
            this.updater = new ExplUpdater();
            this.updater.init(this, this.spcBtlId, this.startStep);

            // 仅用于从setData到start传递数据，传输后直接clear
            this.spcBtlId = '';
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

    onPageShow() {
        this.setExplStepUI();
        this.ctrlr.touchLayerForBack.getComponent(TouchLayerForBack).setYLimit(-980);
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

    update() {
        if (CC_EDITOR) return;
        this.updateAimLine();
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
        this.ctrlr.touchLayerForBack.getComponent(TouchLayerForBack).setYLimit(0);
    }

    // ui -----------------------------------------------------------------

    setUIOfSelfPet(index: number) {
        const pets = this.updater.btlCtrlr.realBattle.selfTeam.pets;
        if (index === -1) {
            let petIdx = 0;
            for (; petIdx < pets.length; petIdx++) this.setUIOfSelfPet(petIdx);
            for (; petIdx < BattlePetLenMax; petIdx++) this.clearUIOfSelfPet(petIdx);
        } else {
            this.setUIOfPet(pets[index], this.selfPetUIs[index]);
        }
    }

    setUIOfEnemyPet(index: number) {
        const pets = this.updater.btlCtrlr.realBattle.enemyTeam.pets;
        if (index === -1) {
            for (let petIdx = 0; petIdx < pets.length; petIdx++) this.setUIOfEnemyPet(petIdx);
        } else {
            const bPet = pets[index];
            const petUI = this.enemyPetUIs[index];
            this.setUIOfPet(bPet, petUI);

            if (bPet.pet.master === BossMaster.main) petUI.petName.node.color = cc.color(230, 180, 0);
            else if (bPet.pet.master === BossMaster.sub) petUI.petName.node.color = cc.color(120, 0, 170);
        }
    }

    setUIOfPet(battlePet: BattlePet, ui: PetUI) {
        ui.node.active = true;
        const pet = battlePet.pet;
        ui.petName.string = PetTool.getCnName(pet);
        ui.subName.string = pet.nickname ? PetTool.getBaseCnName(pet) : '';
        ui.petLv.string = `L${pet.lv}`;
        ui.bar.progress = battlePet.hp / battlePet.hpMax;
        ui.petHP.string = `${Math.ceil(battlePet.hp * 0.1)} / ${Math.ceil(battlePet.hpMax * 0.1)}`;
        ui.node.stopAllActions();
        ui.node.x = 0;

        ListViewCell.rerenderLbl(ui.petName);
        ListViewCell.rerenderLbl(ui.subName);
        ui.layout.updateLayout();
    }

    clearUIOfSelfPet(index: number) {
        this.selfPetUIs[index].node.active = false;
    }

    clearUIOfEnemyPet(index: number) {
        this.enemyPetUIs[index].node.active = false;
    }

    doAttack(beEnemy: boolean, idx: number, combo: number) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[idx];
        const baseNode = ui.node;
        baseNode.stopAllActions();
        cc.tween(baseNode)
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
        const x = params[0] * dir;
        const h = 35 + params[1];

        node.stopAllActions();
        const t = cc.tween;
        const e = cc.easing;
        t(node)
            .delay(delay)
            .set({ opacity: 255 })
            .parallel(
                t().by(1, { x }, { easing: e.quadOut }),
                t().by(0.5, { y: h }, { easing: e.quadOut }).by(0.5, { y: -h }, { easing: e.quadIn }),
                t().delay(0.7).to(0.3, { opacity: 0 })
            )
            .start();
    }

    buffDisplayMax: number = 7;

    addBuff(beEnemy: boolean, petIdx: number, buffId: string, buffTime: number, buffIdx: number) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[petIdx];

        let buffNode = ui.buffNode.children[buffIdx];
        if (!buffNode) {
            buffNode = cc.instantiate(this.buffPrefab);
            buffNode.parent = ui.buffNode;
            if (buffIdx >= this.buffDisplayMax) buffNode.opacity = 0;
        }

        const buffModel = buffModelDict[buffId] as BuffModel;
        const buffBrief = buffModel.brief;
        buffNode.getComponent(cc.Label).string = '[' + buffBrief + String(buffTime) + ']';
        buffNode.color = PageActExpl.getBuffColor(buffModel);
    }

    static getBuffColor(buffModel: BuffModel): cc.Color {
        if (buffModel.buffType === BuffType.buff) return EleColors[buffModel.eleType];
        else return EleDarkColors[buffModel.eleType];
    }

    resetBuffTime(beEnemy: boolean, petIdx: number, buffId: string, buffTime: number, buffIdx: number) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[petIdx];
        const buffNode = ui.buffNode.children[buffIdx];
        if (buffNode) {
            const buffBrief = (buffModelDict[buffId] as BuffModel).brief;
            const newBuffStr = '[' + buffBrief + String(buffTime) + ']';
            buffNode.getComponent(cc.Label).string = newBuffStr;
        }
    }

    removeBuff(beEnemy: boolean, petIdx: number, buffIdx: number = -1) {
        const uis = beEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[petIdx];
        if (buffIdx === -1) {
            for (const buffNode of ui.buffNode.children) buffNode.getComponent(cc.Label).string = '';
        } else {
            const children = ui.buffNode.children;
            for (let index = buffIdx; index < children.length; index++) {
                const buffNode = children[index];
                if (index < children.length - 1) {
                    const nextBuffNode = children[index + 1];
                    buffNode.getComponent(cc.Label).string = nextBuffNode.getComponent(cc.Label).string;
                    buffNode.color = nextBuffNode.color;
                } else {
                    buffNode.getComponent(cc.Label).string = '';
                }
            }
        }
    }

    resetAttriBar(mp: number, mpMax: number, rage: number) {
        this.mpProgress.progress = mp / mpMax;
        this.mpLbl.string = `${mp} / ${mpMax}`;

        this.rageProgress.progress = rage / RageMax;
        this.rageLbl.string = `${rage} / ${RageMax}`;
    }

    // touch -----------------------------------------------------------------

    canCtrlSelfAim: boolean = false;
    canCtrlSelfSkl: boolean = false;
    canSeeEnemy: boolean = false;

    startIdx: number = -1;
    startBeEnemy: boolean = false;

    onBtlTouchStart(event: cc.Event.EventTouch) {
        const eSt = this.updater.state;
        if (eSt !== ExplState.prepare && eSt !== ExplState.battle) return;

        const wPos = event.getLocation();
        const startPos = this.node.convertToNodeSpaceAR(wPos);
        const state = this.calcTouchState(startPos);
        if (!state) return;
        this.startBeEnemy = state.touchEnemy;
        this.startIdx = state.touchIdx;

        this.showEnemyDetail();
    }

    onBtlTouchMove(event: cc.Event.EventTouch) {
        const eSt = this.updater.state;
        if (eSt !== ExplState.prepare && eSt !== ExplState.battle) return;

        const wPos = event.getLocation();
        const curPos = this.node.convertToNodeSpaceAR(wPos);

        this.showSelfAimLine(curPos);
        this.showSelfSklForbidBtn(curPos);

        const state = this.calcTouchState(curPos);
        if (!state) return;
        this.changeEnemyDetail(state.touchEnemy, state.touchIdx);
    }

    onBtlTouchEnd(event: cc.Event.EventTouch) {
        if (event) this.handleTouch(event);

        this.hideSelfAimLine();
        this.hideSelfSklForbidBtn();
        this.hideEnemyDetail();
        this.startIdx = -1;
    }

    handleTouch(event: cc.Event.EventTouch) {
        const eSt = this.updater.state;
        if (eSt !== ExplState.prepare && eSt !== ExplState.battle) return;

        const wPos = event.getLocation();
        const curPos = this.node.convertToNodeSpaceAR(wPos);
        this.handleSelfSklForbidBtn(curPos);

        const state = this.calcTouchState(curPos);
        if (!state) return;
        this.handleSelfAimLine(state.touchEnemy, state.touchIdx, curPos);
    }

    calcTouchState(pos: cc.Vec2): { touchEnemy: boolean; touchIdx: number } | null {
        const touchEnemy = pos.x > 540;
        let touchIdx = Math.floor(pos.y / btlUnitH);
        if (touchIdx >= BattlePetLenMax) return null;
        const uis = touchEnemy ? this.enemyPetUIs : this.selfPetUIs;
        const ui = uis[touchIdx];
        touchIdx = ui.node.active === true ? touchIdx : -1;

        return { touchEnemy, touchIdx };
    }

    ctrlLineShowing: boolean = false;
    movePos!: cc.Vec2;

    showSelfAimLine(curPos: cc.Vec2) {
        if (this.startBeEnemy || this.startIdx === -1 || !this.canCtrlSelfAim) return;
        if (!this.ctrlLineShowing) {
            this.ctrlLineShowing = true;
            this.showAimRange();
            this.aimLiness[this.startIdx][2].show();
        }
        this.movePos = curPos;
        if (this.movePos.y < -this.btlTouchLayer.height) this.movePos.y = -this.btlTouchLayer.height;
    }

    selfAimIdxs: number[] = [];
    enmeyAimIdxs: number[] = [];

    showAimRange() {
        this.selfAimIdxs.length = 0;
        this.enmeyAimIdxs.length = 0;

        const rb = this.updater.btlCtrlr.realBattle;
        const selfBPets = rb.selfTeam.pets;
        const enemyBPets = rb.enemyTeam.pets;

        const curBPet = selfBPets[this.startIdx];
        const battleType = BtlCtrlr.getBattleType(curBPet);
        const aimRangeIdxs = PageActExpl.getAimRange(this.startIdx, battleType);

        for (let index = 0; index < BattlePetLenMax; index++) {
            do {
                const selfUI = this.selfPetUIs[index];
                if (!selfUI.node.active) break;

                const selfBPet = selfBPets[index];
                if (selfBPet.hp === 0 || !aimRangeIdxs.includes(index)) {
                    selfUI.node.stopAllActions();
                    cc.tween(selfUI.node).to(0.2, { opacity: 100 }).start();
                } else {
                    this.selfAimIdxs.push(index);
                }
            } while (false);

            do {
                const enemyUI = this.enemyPetUIs[index];
                if (!enemyUI.node.active) break;

                const enemyBPet = enemyBPets[index];
                if (enemyBPet.hp === 0 || !aimRangeIdxs.includes(index)) {
                    enemyUI.node.stopAllActions();
                    cc.tween(enemyUI.node).to(0.2, { opacity: 100 }).start();
                } else {
                    this.enmeyAimIdxs.push(index);
                }
            } while (false);
        }
    }

    static getAimRange(curIdx: number, battleType: BattleType) {
        if (battleType === BattleType.melee) return [curIdx - 1, curIdx, curIdx + 1];
        else if (battleType === BattleType.charge) return [0, curIdx - 1, curIdx, curIdx + 1];
        else if (battleType === BattleType.shoot) return [0, 1, 2, 3, 4];
        else if (battleType === BattleType.assassinate) return [curIdx - 1, curIdx, curIdx + 1];
        else if (battleType === BattleType.combo) return [curIdx - 1, curIdx, curIdx + 1];
        else return [];
    }

    handleSelfAimLine(curBeEnemy: boolean, curIdx: number, curPos: cc.Vec2) {
        if (!this.ctrlLineShowing) return;
        const btlCtrlr = this.updater.btlCtrlr;
        const selfBPet = btlCtrlr.realBattle.selfTeam.pets[this.startIdx];
        if (curBeEnemy) {
            if (this.enmeyAimIdxs.includes(curIdx)) {
                btlCtrlr.setSelfPetCtrlAimIdx(selfBPet, false, curIdx);
                this.ctrlr.popToast(PetTool.getCnName(selfBPet.pet) + '设定对敌战斗目标');
            }
        } else {
            if (this.selfAimIdxs.includes(curIdx)) {
                if (curIdx === this.startIdx && curPos.x > 352) return; // 对自己使用，需要多往左划一点
                btlCtrlr.setSelfPetCtrlAimIdx(selfBPet, true, curIdx);
                this.ctrlr.popToast(PetTool.getCnName(selfBPet.pet) + '设定对己方的战斗目标');
            }
        }
    }

    hideSelfAimLine() {
        if (!this.ctrlLineShowing) return;
        this.ctrlLineShowing = false;
        this.hideAimRange();

        for (let index = 0; index < BattlePetLenMax; index++) {
            this.aimLiness[index][2].hide();
        }
    }

    hideAimRange() {
        for (let index = 0; index < BattlePetLenMax; index++) {
            const selfUINode = this.selfPetUIs[index].node;
            selfUINode.stopAllActions();
            cc.tween(selfUINode).to(0.2, { opacity: 255 }).start();

            const enemyUINode = this.enemyPetUIs[index].node;
            enemyUINode.stopAllActions();
            cc.tween(enemyUINode).to(0.2, { opacity: 255 }).start();
        }
    }

    sklForbidBtnShowing: boolean = false;

    showSelfSklForbidBtn(curPos: cc.Vec2) {
        if (this.startBeEnemy || this.startIdx === -1 || !this.canCtrlSelfSkl) return;
        if (this.sklForbidBtnLayer.node.getNumberOfRunningActions() > 0) return;

        if (!this.sklForbidBtnShowing) {
            this.sklForbidBtnShowing = true;
            const bPet = this.updater.btlCtrlr.realBattle.selfTeam.pets[this.startIdx];
            const skillIds = bPet.pet2.skillIds;
            const forbidFlag = bPet.sklForbidFlag;
            for (let index = 0; index < 4; index++) {
                if (index < skillIds.length) {
                    const name = skillModelDict[skillIds[index]].cnName;
                    const state = ((forbidFlag >> index) & 1) === 1 ? SklForbidBtnState.forbid : SklForbidBtnState.open;
                    this.sklForbidBtnLayer.setData(index, name, state);
                } else {
                    this.sklForbidBtnLayer.setData(index, '', SklForbidBtnState.unuse);
                }
            }

            this.sklForbidBtnLayer.node.opacity = 255;
            cc.tween(this.sklForbidBtnLayer.node).to(0.2, { y: -this.btlTouchLayer.height }).start();
        }

        for (let index = 0; index < 4; index++) {
            const btn = this.sklForbidBtnLayer.btns[index];
            btn.bar.color = cc.color(220, 220, 220);
        }

        for (let index = 0; index < 4; index++) {
            const btn = this.sklForbidBtnLayer.btns[index];
            if (btn.state === SklForbidBtnState.unuse) continue;
            const rect = this.sklForbidBtnLayer.getRect(index);
            if (rect.contains(curPos)) {
                btn.bar.color = cc.color(200, 200, 200);
                break;
            }
        }
    }

    handleSelfSklForbidBtn(curPos: cc.Vec2) {
        if (!this.sklForbidBtnShowing) return;
        for (let index = 0; index < 4; index++) {
            const btn = this.sklForbidBtnLayer.btns[index];
            if (btn.state === SklForbidBtnState.unuse) continue;
            const rect = this.sklForbidBtnLayer.getRect(index);
            if (rect.contains(curPos)) {
                const btlCtrlr = this.updater.btlCtrlr;
                const selfBPet = btlCtrlr.realBattle.selfTeam.pets[this.startIdx];
                const forbid = btlCtrlr.switchSelfPetForbidSkl(selfBPet, index);
                const petName = PetTool.getCnName(selfBPet.pet);
                const actName = forbid ? '封印招式' : '解封招式';
                const sklName = skillModelDict[selfBPet.pet2.skillIds[index]].cnName;
                this.ctrlr.popToast(petName + actName + sklName);
                break;
            }
        }
    }

    hideSelfSklForbidBtn() {
        if (!this.sklForbidBtnShowing) return;
        this.sklForbidBtnShowing = false;
        for (let index = 0; index < 4; index++) {
            const btn = this.sklForbidBtnLayer.btns[index];
            btn.bar.color = cc.color(220, 220, 220);
        }
        cc.tween(this.sklForbidBtnLayer.node)
            .to(0.2, { y: -this.btlTouchLayer.height - this.sklForbidBtnLayer.node.height })
            .call(() => (this.sklForbidBtnLayer.node.opacity = 0))
            .start();
    }

    showEnemyDetail() {
        if (!this.startBeEnemy || this.startIdx === -1 || !this.canSeeEnemy) return;
        this.enemyDetail.show();
        this.enemyDetail.setData(this.updater.btlCtrlr.realBattle.enemyTeam.pets[this.startIdx]);
    }

    changeEnemyDetail(curBeEnemy: boolean, curIdx: number) {
        if (!this.startBeEnemy || this.startIdx === -1 || !this.canSeeEnemy) return;
        if (!curBeEnemy || curIdx === -1 || curIdx === this.startIdx) return;
        this.startIdx = curIdx;
        this.enemyDetail.setData(this.updater.btlCtrlr.realBattle.enemyTeam.pets[this.startIdx]);
    }

    hideEnemyDetail() {
        if (!this.canSeeEnemy) return;
        this.enemyDetail.hide();
    }

    setSelfAim(selfIdx: number, toSelf: boolean, aimIdx: number) {
        const lines = this.aimLiness[selfIdx];
        const line = toSelf ? lines[0] : lines[1];
        if (aimIdx >= 0) line.show();
        else line.hide();
    }

    setSelfSklForbid(selfIdx: number, fbd1: boolean, fbd2: boolean, fbd3: boolean, fbd4: boolean) {
        const petUI = this.selfPetUIs[selfIdx];
        let markIdx = 0;

        if (fbd1) petUI.setForbidMark(markIdx++, '1'); // 先调用函数，再idx增加
        if (fbd2) petUI.setForbidMark(markIdx++, '2');
        if (fbd3) petUI.setForbidMark(markIdx++, '3');
        if (fbd4) petUI.setForbidMark(markIdx++, '4');
        for (let index = markIdx; index < 4; index++) petUI.setForbidMark(index, null);

        petUI.buffNode.x = 25 + 30 * markIdx;

        if (markIdx === 4) this.buffDisplayMax = 5;
        else if (markIdx >= 2) this.buffDisplayMax = 6;
        else this.buffDisplayMax = 7;

        const buffNodes = petUI.layout.node.children;
        for (let index = 0; index < buffNodes.length; index++) {
            buffNodes[index].opacity = index < this.buffDisplayMax ? 255 : 0;
        }
    }

    updateAimLine() {
        if (!this.ctrlLineShowing) return;

        const btlCtrlr = this.updater.btlCtrlr;
        const selfBPets = btlCtrlr.realBattle.selfTeam.pets;
        for (let index = 0; index < BattlePetLenMax; index++) {
            if (index >= selfBPets.length) break;

            const selfPetNode = this.selfPetUIs[index].node;
            const startX = selfPetNode.x + 460;
            const startY = selfPetNode.y - 86;
            const lines = this.aimLiness[index];

            const selfAimLine = lines[0];
            if (selfAimLine.isShowing()) {
                const selfBPet = selfBPets[index];
                const aimIdx = selfBPet.ctrlSelfAimIdx;
                if (aimIdx >= 0) {
                    const aimPetNode = this.selfPetUIs[aimIdx].node;
                    const aimX = aimPetNode.x + 352;
                    const aimY = aimPetNode.y - 86;
                    selfAimLine.setPos(startX, startY, aimX, aimY);
                }
            }

            const enemyAimLine = lines[1];
            if (enemyAimLine.isShowing()) {
                const selfBPet = selfBPets[index];
                const aimIdx = selfBPet.ctrlEnemyAimIdx;
                if (aimIdx >= 0) {
                    const aimPetNode = this.enemyPetUIs[aimIdx].node;
                    const aimX = aimPetNode.x + 728;
                    const aimY = aimPetNode.y - 86;
                    enemyAimLine.setPos(startX, startY, aimX, aimY);
                }
            }

            const touchAimLine = lines[2];
            if (touchAimLine.isShowing()) {
                touchAimLine.setPos(startX, startY, this.movePos.x, this.movePos.y);
            }
        }
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
