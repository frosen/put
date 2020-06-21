/*
 * CellPkgCatcher.ts
 * 道具列表中的捕捉器项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellPkgBase } from 'pages/page_pkg/scripts/CellPkgBase';
import { Catcher, BioTypeNames, EleTypeNames, BattleTypeNames, PetRankNames } from 'scripts/DataSaved';
import { catcherModelDict } from 'configs/CatcherModelDict';

@ccclass
export class CellPkgCatcher extends CellPkgBase {
    @property(cc.Label)
    lvLbl: cc.Label = null;

    @property(cc.Label)
    rankLbl: cc.Label = null;

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

    @property(cc.Label)
    countLbl: cc.Label = null;

    setData(itemIdx: number, catcher: Catcher) {
        super.setData(itemIdx, catcher);
        let catcherModel = catcherModelDict[catcher.id];

        this.nameLbl.string = catcherModel.cnName;
        this.lvLbl.string = `[L${catcherModel.lvMin}~${catcherModel.lvMax}]`;
        this.rankLbl.string = `[${PetRankNames[catcherModel.rankMin]}~${PetRankNames[catcherModel.rankMax]}]`;

        CellPkgBase.rerenderLbl(this.nameLbl);
        CellPkgBase.rerenderLbl(this.lvLbl);
        CellPkgBase.rerenderLbl(this.rankLbl);

        this.rateLbl.string = `成功率+${catcherModel.rate}%`;
        CellPkgBase.rerenderLbl(this.rateLbl);
        CellPkgCatcher.setTypeName(catcherModel.bioType, BioTypeNames, this.bioLbl, this.bioLbl.node.parent);
        CellPkgCatcher.setTypeName(catcherModel.eleType, EleTypeNames, this.eleLbl, this.eleLbl.node.parent);
        CellPkgCatcher.setTypeName(catcherModel.battleType, BattleTypeNames, this.btlTypeLbl, this.btlTypeLbl.node.parent);

        this.countLbl.string = 'x ' + String(catcher.count);

        for (const layout of this.layouts) layout.updateLayout();
    }

    static setTypeName(data: number, names: string[], lbl: cc.Label, baseNode: cc.Node) {
        if (data) {
            baseNode.scaleX = 1;
            lbl.string = names[data];
            CellPkgBase.rerenderLbl(lbl);
        } else {
            baseNode.scaleX = 0;
        }
    }
}
