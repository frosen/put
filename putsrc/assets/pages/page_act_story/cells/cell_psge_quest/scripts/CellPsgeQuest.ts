/*
 * CellPsgeQuest.ts
 * 发布一个任务，需要完成后才能继续的段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { QuestModelDict } from '../../../../../configs/QuestModelDict';
import { QuestPsge } from '../../../../../scripts/DataModel';
import { Quest } from '../../../../../scripts/DataSaved';
import { CellPsgeBase } from '../../../scripts/CellPsgeBase';

@ccclass
export class CellPsgeQuest extends CellPsgeBase {
    @property(cc.Label)
    lbl: cc.Label = null!;

    @property(cc.Button)
    btn: cc.Button = null!;

    clickCallback?: (cell: CellPsgeQuest) => void;

    onLoad() {
        if (CC_EDITOR) return;
        this.btn.node.on('click', this.onClick.bind(this));
    }

    setData(questPsge: QuestPsge, curQuest?: Quest) {
        const questModel = QuestModelDict[questPsge.questId];
        if (!curQuest) {
            this.lbl.string = '接受任务：' + questModel.cnName;
        } else {
            this.lbl.string = '完成任务：' + questModel.cnName;
        }
    }

    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
