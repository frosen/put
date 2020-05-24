/*
 * PagePetDetail.ts
 * 宠物信息页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PagePetDetailLVD from './PagePetDetailLVD';
import { Pet, Feature } from 'scripts/DataSaved';
import { Pet2 } from 'scripts/DataOther';
import ListViewCell from 'scripts/ListViewCell';
import { PetDataTool } from 'scripts/Memory';
import { FeatureGainType } from '../cells/cell_feature/scripts/CellFeature';

@ccclass
export default class PagePetDetail extends PageBase {
    dirtyToken: number = 0;

    curPet: Pet = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        let lvd = this.getComponent(PagePetDetailLVD);
        lvd.page = this;
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

    onCellClick(cell: ListViewCell) {}

    onCellClickFuncBtn(cell: ListViewCell) {
        // this.showFuncBar(cell.curCellIdx, cell.node);
    }

    // -----------------------------------------------------------------
}
