/*
 * CellPsgeQuest.ts
 * 发布一个任务，需要完成后才能继续的段落
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { QuestModelDict } from '../../../../../configs/QuestModelDict';
import { QuestPsge } from '../../../../../scripts/DataModel';
import { Evt, EvtRztV } from '../../../../../scripts/DataSaved';
import { CellPsgeBase } from '../../../scripts/CellPsgeBase';
import { PSBColor, PSBGray } from '../../cell_psge_selection/scripts/PsgeSelectionBtn';

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

        if (evt.rztDict[questId] === EvtRztV.done) {
            this.lbl.string = '需要完成任务：' + questModel.cnName;
            this.btn.interactable = false;
            this.lbl.node.color = PSBGray;
        } else if (evt.curQuest && evt.curQuest.id === questId) {
            this.lbl.string = '需要完成任务：' + questModel.cnName;
            this.btn.interactable = true;
            this.lbl.node.color = PSBColor;
        } else {
            this.lbl.string = '请先接受任务：' + questModel.cnName;
            this.btn.interactable = true;
            this.lbl.node.color = PSBColor;
        }
    }

    onClick() {
        if (this.clickCallback) this.clickCallback(this);
    }
}
