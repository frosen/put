/*
 * CellPkgCatcher.ts
 * 道具列表中的捕捉器项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';
import {
    Catcher,
    BioTypeNames,
    EleTypeNames,
    BattleTypeNames,
    EleDarkColors,
    BioColors,
    BattleTypeColors
} from '../../../../../scripts/DataSaved';
import { CatcherModelDict } from '../../../../../configs/CatcherModelDict';
import { CatcherModel } from '../../../../../scripts/DataModel';
import { ListViewCell } from '../../../../../scripts/ListViewCell';

@ccclass
export class CellPkgCatcher extends CellPkgCnsum {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    rateLbl: cc.Label = null;

    @property(cc.Label)
    bioLbl: cc.Label = null;

    @property(cc.Label)
    eleLbl: cc.Label = null;

    @property(cc.Label)
    btlTypeLbl: cc.Label = null;

    @property([cc.Layout])
    layouts: cc.Layout[] = [];

    setData(itemIdx: number, catcher: Catcher) {
        super.setData(itemIdx, catcher);
        const catcherModel = CatcherModelDict[catcher.id];

        this.setModelData(catcherModel);

        this.setCount(catcher.count);
    }

    setDataByModel(itemIdx: number, catcherModel: CatcherModel, count: number) {
        super.setData(itemIdx, null);
        this.setModelData(catcherModel);
        this.setCount(count);
    }

    setModelData(catcherModel: CatcherModel) {
        this.nameLbl.string = catcherModel.cnName;
        this.lvLbl.string = `[L${catcherModel.lvMin}~${catcherModel.lvMax}]`;

        ListViewCell.rerenderLbl(this.nameLbl);
        ListViewCell.rerenderLbl(this.lvLbl);

        this.rateLbl.string = `成功率${Math.round(catcherModel.rate * 0.5)}-${catcherModel.rate}%`;
        ListViewCell.rerenderLbl(this.rateLbl);
        CellPkgCatcher.setTypeName(catcherModel.bioType, BioTypeNames, BioColors, this.bioLbl);
        CellPkgCatcher.setTypeName(catcherModel.eleType, EleTypeNames, EleDarkColors, this.eleLbl);
        CellPkgCatcher.setTypeName(catcherModel.battleType, BattleTypeNames, BattleTypeColors, this.btlTypeLbl);

        for (const layout of this.layouts) layout.updateLayout();
    }

    static setTypeName(type: number, names: string[], colors: cc.Color[], lbl: cc.Label) {
        const baseNode = lbl.node.parent;
        if (type) {
            baseNode.scaleX = 1;
            baseNode.color = colors[type];
            lbl.string = names[type];
            ListViewCell.rerenderLbl(lbl);
        } else {
            baseNode.scaleX = 0;
        }
    }
}
