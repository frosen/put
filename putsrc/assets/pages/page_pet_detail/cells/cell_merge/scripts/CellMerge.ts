/*
 * CellMerge.ts
 * 合并信息的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { petModelDict } from '../../../../../configs/PetModelDict';

import { Merge } from '../../../../../scripts/DataSaved';
import { featureModelDict } from '../../../../../configs/FeatureModelDict';

@ccclass
export class CellMerge extends ListViewCell {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    featureLbl: cc.Label = null;

    @property(cc.Layout)
    layout: cc.Layout = null;

    @property(cc.Sprite)
    petSp: cc.Sprite = null;

    setData(mergeData: Merge) {
        this.lvLbl.string = `${mergeData.oPetLv}级时`;
        this.nameLbl.string = petModelDict[mergeData.petId].cnName;
        this.featureLbl.string = `[${featureModelDict[mergeData.featureId].cnBrief} +${mergeData.featureLv}]`;

        ListViewCell.rerenderLbl(this.lvLbl);
        ListViewCell.rerenderLbl(this.nameLbl);
        ListViewCell.rerenderLbl(this.featureLbl);
        this.layout.updateLayout();
    }
}
