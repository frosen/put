/*
 * CellPkgCatcher.ts
 * 道具列表中的捕捉器项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgCnsum } from 'pages/page_pkg/scripts/CellPkgCnsum';
import { Catcher, BioTypeNames, EleTypeNames, BattleTypeNames } from 'scripts/DataSaved';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { CatcherModel } from 'scripts/DataModel';
import { ListViewCell } from 'scripts/ListViewCell';

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
        const catcherModel = catcherModelDict[catcher.id];

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
        CellPkgCatcher.setTypeName(catcherModel.bioType, BioTypeNames, this.bioLbl, this.bioLbl.node.parent);
        CellPkgCatcher.setTypeName(catcherModel.eleType, EleTypeNames, this.eleLbl, this.eleLbl.node.parent);
        CellPkgCatcher.setTypeName(catcherModel.battleType, BattleTypeNames, this.btlTypeLbl, this.btlTypeLbl.node.parent);

        for (const layout of this.layouts) layout.updateLayout();
    }

    static setTypeName(data: number, names: string[], lbl: cc.Label, baseNode: cc.Node) {
        if (data) {
            baseNode.scaleX = 1;
            lbl.string = names[data];
            ListViewCell.rerenderLbl(lbl);
        } else {
            baseNode.scaleX = 0;
        }
    }
}
