/*
 * PagePetDetail.ts
 * 宠物信息页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from 'scripts/PageBase';
import { ListView } from 'scripts/ListView';
import { PagePetDetailLVD } from './PagePetDetailLVD';
import { Pet, Feature } from 'scripts/DataSaved';
import { Pet2 } from 'scripts/DataOther';
import { ListViewCell } from 'scripts/ListViewCell';
import { PetDataTool, GameDataTool } from 'scripts/Memory';
import { FeatureGainType } from '../cells/cell_feature/scripts/CellFeature';
import { PagePkgEquip } from 'pages/page_pkg_equip/scripts/PagePkgEquip';
import { FuncBar } from 'pages/page_pet/prefabs/prefab_func_bar/scripts/FuncBar';

@ccclass
export class PagePetDetail extends PageBase {
    dirtyToken: number = 0;

    curPet: Pet = null;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null;

    funcBar: FuncBar = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        let lvd = this.getComponent(PagePetDetailLVD);
        lvd.page = this;

        let funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node;

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '更换', callback: this.onChangeEquip.bind(this) },
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) }
        ]);
    }

    setData(data: Pet) {
        this.curPet = data;
    }

    onPageShow() {
        this.ctrlr.setTitle('宠物详情');
        this.ctrlr.setBackBtnEnabled(true);

        let lvd = this.getComponent(PagePetDetailLVD);
        lvd.curPet = this.curPet;

        let pet2 = new Pet2();
        pet2.setData(this.curPet);
        lvd.curPet2 = pet2;

        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken != curDirtyToken) {
            this.dirtyToken = curDirtyToken;

            let featureDatas: { feature: Feature; type: FeatureGainType }[] = [];
            for (const feature of this.curPet.inbornFeatures) featureDatas.push({ feature, type: FeatureGainType.inborn });
            let selfFeatures = PetDataTool.getSelfFeaturesByCurLv(this.curPet);
            for (const feature of selfFeatures) featureDatas.push({ feature, type: FeatureGainType.self });
            for (const feature of this.curPet.learnedFeatures) featureDatas.push({ feature, type: FeatureGainType.learned });
            lvd.featureDatas = featureDatas;

            this.getComponentInChildren(ListView).resetContent(true);
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
        this.ctrlr.pushPage(PagePkgEquip, { pet: this.curPet, idx: index });
    }

    onSkillCellClick(index: number, cell: ListViewCell) {}

    // -----------------------------------------------------------------

    onChangeEquip(cellIdx: number) {
        this.ctrlr.pushPage(PagePkgEquip, { pet: this.curPet, idx: this.curEquipIdx });
    }

    onMoveUpCell(cellIdx: number) {
        let rzt = GameDataTool.moveEquipInPetList(
            this.ctrlr.memory.gameData,
            this.curPet,
            this.curEquipIdx,
            this.curEquipIdx - 1
        );
        if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
    }

    onMoveDownCell(cellIdx: number) {
        let rzt = GameDataTool.moveEquipInPetList(
            this.ctrlr.memory.gameData,
            this.curPet,
            this.curEquipIdx,
            this.curEquipIdx + 1
        );
        if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
    }
}
