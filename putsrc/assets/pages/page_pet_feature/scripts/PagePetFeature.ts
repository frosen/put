/*
 * PagePetFeature.ts
 * 精灵特性选择页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { ListView } from '../../../scripts/ListView';
import { Feature } from '../../../scripts/DataSaved';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { NavBar } from '../../../scripts/NavBar';
import { FeatureGainType } from '../../page_pet_detail/cells/cell_feature/scripts/CellFeature';
import { PagePetFeatureLVD } from './PagePetFeatureLVD';

@ccclass
export class PagePetFeature extends PageBase {
    @property(ListView)
    list: ListView = null;

    lvd: PagePetFeatureLVD = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.list.delegate as PagePetFeatureLVD;
        this.lvd.page = this;
    }

    pageName: string = null;
    features: Feature[] = null;
    gainTypes: FeatureGainType[] = null;
    clickCallback: (feature: Feature, gainType: FeatureGainType) => void = null;

    /**
     * name
     * features
     * gainTypes
     * callback
     */
    setData(pageData: any) {
        this.pageName = pageData.name;
        this.features = pageData.features;
        this.gainTypes = pageData.gainTypes;
        this.clickCallback = pageData.callback;
        cc.assert(this.pageName, 'PUT 精灵特性选择页面必须有名字');
        cc.assert(this.features, 'PUT 精灵特性选择页面必须有特性列表');
        cc.assert(this.gainTypes, 'PUT 精灵特性选择页面必须有特性来源列表');
        cc.assert(this.clickCallback, 'PUT 精灵特性选择页面必须有回调');
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true);
        navBar.setTitle(this.pageName);
    }

    onPageShow() {
        this.list.resetContent(true);
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {
        const cellIdx = cell.curCellIdx;
        this.clickCallback(this.features[cellIdx], this.gainTypes[cellIdx]);
    }
}
