/*
 * CellFeature.ts
 * 特性列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import { Feature } from 'scripts/DataSaved';
import { FeatureModel } from 'scripts/DataModel';
import { featureModelDict } from 'configs/FeatureModelDict';
import { FeatureDataTool } from 'scripts/Memory';

export enum FeatureGainType {
    inborn = 1,
    self = 2,
    learned
}

const FeatureGainNames = ['', '天赋', '生物', '习得'];

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

    clickCallback: (cell: CellFeature) => void = null;

    setData(feature: Feature, type: FeatureGainType) {
        this.feature = feature;
        let featureModel: FeatureModel = featureModelDict[feature.id];

        this.nameLbl.string = FeatureGainNames[type] + '特性・' + featureModel.cnBrief;
        this.lvLbl.string = `[L${feature.lv}]`;

        let datas = FeatureDataTool.getDatas(feature.id, feature.lv);
        let info = featureModel.getInfo(datas);
        this.infoLbl.string = info;
    }

    onClick() {
        cc.log('PUT cell click: ', this.feature.id, this.curCellIdx);
        if (this.clickCallback) this.clickCallback(this);
    }
}
