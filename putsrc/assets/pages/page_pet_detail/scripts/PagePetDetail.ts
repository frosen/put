/*
 * PagePetDetail.ts
 * 精灵信息页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { ListView } from '../../../scripts/ListView';
import { PagePetDetailLVD } from './PagePetDetailLVD';
import { Pet, Feature, PetState } from '../../../scripts/DataSaved';
import { Pet2 } from '../../../scripts/DataOther';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { GameDataTool } from '../../../scripts/Memory';
import { CellFeature, FeatureGainType } from '../cells/cell_feature/scripts/CellFeature';
import { PagePkgEquip } from '../../page_pkg_equip/scripts/PagePkgEquip';
import { FuncBar } from '../../page_pet/scripts/FuncBar';
import { NavBar } from '../../../scripts/NavBar';
import { CellSkill } from '../cells/cell_skill/scripts/CellSkill';

@ccclass
export class PagePetDetail extends PageBase {
    dirtyToken: number = 0;

    curPet!: Pet;
    curPetForCheck?: Pet;

    immutable: boolean = false; // 是否允许更改

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null!;

    @property(cc.Node)
    leftBtnNode: cc.Node = null!;

    @property(cc.Node)
    rightBtnNode: cc.Node = null!;

    funcBar!: FuncBar;

    static listPos: number | undefined = undefined;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const lvd = this.getComponent(PagePetDetailLVD);
        lvd.page = this;

        const funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node;

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '更换', callback: this.onChangeEquip.bind(this) },
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) }
        ]);

        this.leftBtnNode.on(cc.Node.EventType.TOUCH_END, this.onClickLeft.bind(this));
        this.rightBtnNode.on(cc.Node.EventType.TOUCH_END, this.onClickRight.bind(this));
    }

    setData(pageData: { pet: Pet; immutable: boolean }) {
        cc.assert(pageData && pageData.pet, 'PUT 精灵详情必有精灵属性');
        this.curPet = pageData.pet;
        this.immutable = pageData.immutable || false;
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true);
        navBar.setTitle('精灵详情');
    }

    onPageShow() {
        const lvd = this.getComponent(PagePetDetailLVD);
        lvd.curPet = this.curPet;

        const pet2 = new Pet2();
        pet2.setData(this.curPet, 1);
        lvd.curPet2 = pet2;

        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken !== curDirtyToken || this.curPetForCheck !== this.curPet) {
            this.dirtyToken = curDirtyToken;
            this.curPetForCheck = this.curPet;

            const exFeatureIds = this.curPet.exFeatureIds;
            const featureDatas: { feature: Feature; type: FeatureGainType }[] = [];
            for (const feature of this.curPet.inbFeatures) {
                const type = exFeatureIds.includes(feature.id) ? FeatureGainType.expert : FeatureGainType.inborn;
                featureDatas.push({ feature, type });
            }
            for (const feature of this.curPet.lndFeatures) featureDatas.push({ feature, type: FeatureGainType.learned });
            lvd.featureDatas = featureDatas;

            const lv = this.getComponentInChildren(ListView);
            if (PagePetDetail.listPos !== undefined) {
                lv.clearContent();
                lv.createContent(PagePetDetail.listPos);
                PagePetDetail.listPos = undefined;
            } else lv.resetContent(true);
        }
    }

    // -----------------------------------------------------------------

    onEquipCellClick(index: number, cell: ListViewCell) {}

    curEquipIdx: number = -1;

    onEquipCellClickFuncBtn(index: number, cell: ListViewCell) {
        this.curEquipIdx = index;
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    onEquipBlankCellClick(index: number, cell: ListViewCell) {
        if (!this.checkPetWithMaster()) return;
        this.ctrlr.pushPage(PagePkgEquip, { pet: this.curPet, idx: index });
    }

    onSkillCellClick(sklIdx: number, cell: CellSkill) {}

    onFeatureCellClick(cellFeature: CellFeature) {}

    // -----------------------------------------------------------------

    onChangeEquip(cellIdx: number) {
        if (!this.checkPetWithMaster()) return;
        this.ctrlr.pushPage(PagePkgEquip, { pet: this.curPet, idx: this.curEquipIdx });
    }

    onMoveUpCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const petIdx = GameDataTool.getPetIdx(gameData, this.curPet);
        if (petIdx === -1) return this.ctrlr.popToast('精灵有误');
        const rzt = GameDataTool.moveEquipInPetList(gameData, petIdx, this.curEquipIdx, this.curEquipIdx - 1);
        if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
        else this.ctrlr.popToast(rzt);
    }

    onMoveDownCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const petIdx = GameDataTool.getPetIdx(gameData, this.curPet);
        if (petIdx === -1) return this.ctrlr.popToast('精灵有误');
        const rzt = GameDataTool.moveEquipInPetList(gameData, petIdx, this.curEquipIdx, this.curEquipIdx + 1);
        if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
        else this.ctrlr.popToast(rzt);
    }

    checkPetWithMaster(): boolean {
        const gameData = this.ctrlr.memory.gameData;
        const withRzt = GameDataTool.checkPetWithMaster(gameData, this.curPet);
        if (withRzt !== GameDataTool.SUC) {
            this.ctrlr.popToast('无法变更！\n' + withRzt);
            return false;
        }
        return true;
    }

    // -----------------------------------------------------------------

    onClickLeft() {
        const pets = this.ctrlr.memory.gameData.pets;
        const petIdx = pets.indexOf(this.curPet);
        if (petIdx <= 0 || pets.length <= petIdx) return;

        this.gotoOtherPet(pets[petIdx - 1]);
    }

    onClickRight() {
        const pets = this.ctrlr.memory.gameData.pets;
        const petIdx = pets.indexOf(this.curPet);
        if (petIdx < 0 || pets.length - 1 <= petIdx) return;

        this.gotoOtherPet(pets[petIdx + 1]);
    }

    gotoOtherPet(pet: Pet) {
        PagePetDetail.listPos = this.getComponentInChildren(ListView).content.y;
        this.ctrlr.pushPage(PagePetDetail, { pet });
    }
}
