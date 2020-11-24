/*
 * CellFeature.ts
 * 特性列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { Feature } from '../../../../../scripts/DataSaved';
import { FeatureModel } from '../../../../../scripts/DataModel';
import { featureModelDict } from '../../../../../configs/FeatureModelDict';
import { FeatureTool } from '../../../../../scripts/Memory';

export enum FeatureGainType {
    inborn = 1,
    expert,
    learned
}

const FeatureGainNames = ['', '天赋', '专精', '习得'];

@ccclass
export class CellFeature extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    infoLbl: cc.Label = null;

    @property(cc.Sprite)
    featureSp: cc.Sprite = null;

    feature: Feature = null;
    gainType: FeatureGainType = null;

    clickCallback: (cell: CellFeature) => void = null;

    setData(feature: Feature, type: FeatureGainType) {
        this.feature = feature;
        this.gainType = type;
        const featureModel: FeatureModel = featureModelDict[feature.id];

        this.nameLbl.string = FeatureGainNames[type] + '特性・' + featureModel.cnBrief;
        this.lvLbl.string = `[L${feature.lv}]`;

        const datas = FeatureTool.getDatas(feature.id, feature.lv);
        const info = featureModel.getInfo(datas);
        this.infoLbl.string = info;
    }

    onClick() {
        cc.log('PUT cell click: ', this.feature.id, this.curCellIdx);
        if (this.clickCallback) this.clickCallback(this);
    }
}
