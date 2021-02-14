/*
 * CellPsgeQuest.ts
 * 发布一个任务，需要完成后才能继续的段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { QuestModelDict } from '../../../../../configs/QuestModelDict';
import { QuestPsge } from '../../../../../scripts/DataModel';
import { Evt, Quest } from '../../../../../scripts/DataSaved';
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

    setData(questPsge: QuestPsge, evt: Evt) {
        const questId = questPsge.questId;
        const questModel = QuestModelDict[questId];

        if (evt.rztDict[questId] === 2) {
            this.lbl.string = '需要完成任务：' + questModel.cnName;
            this.btn.interactable = false;
            this.lbl.node.color = cc.color(120, 120, 120);
        } else if (evt.curQuest && evt.curQuest.id === questId) {
            this.lbl.string = '需要完成任务：' + questModel.cnName;
            this.btn.interactable = true;
            this.lbl.node.color = cc.color(43, 33, 4);
        } else {
            this.lbl.string = '请先接受任务：' + questModel.cnName;
            this.btn.interactable = true;
            this.lbl.node.color = cc.color(43, 33, 4);
        }
    }

    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
