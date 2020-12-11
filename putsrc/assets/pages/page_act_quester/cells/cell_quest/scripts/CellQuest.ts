/*
 * CellQuest.ts
 * 任务列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { petModelDict } from '../../../../../configs/PetModelDict';

import { AcceQuestInfo, Quest, QuestDLines } from '../../../../../scripts/DataSaved';
import { CnsumTool, EquipTool, MoneyTool, QuestTool } from '../../../../../scripts/Memory';
import {
    ExplModel,
    ExplStepNames,
    FightQuestNeed,
    GatherQuestNeed,
    QuestModel,
    QuestType,
    SearchQuestNeed,
    StepTypesByMax,
    SupportQuestNeed
} from '../../../../../scripts/DataModel';
import { actPosModelDict, PAKey } from '../../../../../configs/ActPosModelDict';
import { CellUpdateDisplay } from '../../../../page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';

export enum QuestState {
    toAccept = 1,
    toRefresh,
    toFinish,
    toSubmit
}

@ccclass
export class CellQuest extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    stateLbl: cc.Label = null;

    @property(cc.Label)
    tipLbl: cc.Label = null;

    @property([cc.Label])
    needLbls: cc.Label[] = [];

    @property([cc.Label])
    awardLbls: cc.Label[] = [];

    @property(cc.Label)
    detailLbl: cc.Label = null;

    @property(cc.Sprite)
    questSp: cc.Sprite = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    @property(cc.Layout)
    layouts: cc.Layout[] = [];

    clickCallback: (cell: CellQuest) => void = null;
    funcBtnCallback: (cell: CellQuest) => void = null;

    atQuester: boolean = false;

    questModel: QuestModel;
    quest: Quest;
    acceQuestInfo: AcceQuestInfo;

    state: QuestState;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(questModel: QuestModel, quest: Quest, acceQuestInfo: AcceQuestInfo) {
        this.questModel = questModel;
        this.quest = quest;
        this.acceQuestInfo = acceQuestInfo;

        this.nameLbl.string = questModel.cnName;
        CellQuest.getQuestNeedStr(quest, questModel, this.needLbls);
        CellQuest.getQuestAwardStr(quest, questModel, this.awardLbls);
        this.detailLbl.string = questModel.descs[0] + '\n' + questModel.descs[1];

        let stateStr: string;
        let tipStr: string;
        if (!acceQuestInfo) {
            this.state = QuestState.toAccept;
            stateStr = '';
            tipStr = '（点击接受）';
        } else if (quest.progress >= QuestTool.getRealCount(quest)) {
            this.state = QuestState.toSubmit;
            stateStr = '  完成';
            tipStr = this.atQuester ? '（点击提交）' : '';
        } else if (questModel.type === QuestType.support) {
            this.state = QuestState.toRefresh;
            stateStr = `  ${quest.progress} / ${QuestTool.getRealCount(quest)}`;
            tipStr = '（点击刷新）';
        } else if (questModel.type === QuestType.search) {
            this.state = QuestState.toFinish;
            stateStr = `  0 / 1`;
            tipStr = '';
        } else {
            this.state = QuestState.toFinish;
            stateStr = `  ${quest.progress} / ${QuestTool.getRealCount(quest)}`;
            tipStr = '';
        }

        if (quest.dLine) {
            const diff = Date.now() - quest.startTime + QuestDLines[quest.dLine];
            stateStr += ' [提交时限' + CellUpdateDisplay.getDiffStr(diff) + ']';
        }

        this.stateLbl.string = stateStr;
        this.tipLbl.string = tipStr;

        ListViewCell.rerenderLbl(this.nameLbl);
        ListViewCell.rerenderLbl(this.stateLbl);
        ListViewCell.rerenderLbl(this.tipLbl);
        for (const lbl of this.needLbls) ListViewCell.rerenderLbl(lbl);
        for (const lbl of this.awardLbls) ListViewCell.rerenderLbl(lbl);

        for (const layout of this.layouts) layout.updateLayout();
    }

    static getQuestNeedStr(quest: Quest, questModel: QuestModel, lbls: cc.Label[]) {
        switch (questModel.type) {
            case QuestType.support: {
                const need = questModel.need as SupportQuestNeed;
                const itemModel = CnsumTool.getModelById(need.itemId);

                lbls[0].string = '提供';
                CellQuest.lbl(lbls[1], itemModel.cnName, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], 'x ' + String(QuestTool.getRealCount(quest)), cc.Color.ORANGE);
                lbls[3].string = '';
                lbls[4].string = '';
                lbls[5].string = '';
                break;
            }
            case QuestType.fight: {
                const need = questModel.need as FightQuestNeed;

                let petStr = '';
                for (let index = 0; ; index++) {
                    const petId = need.petIds[index];
                    const petModel = petModelDict[petId];
                    petStr += petModel.cnName;
                    if (index === need.petIds.length - 1) break;
                    petStr += ', ';
                }

                lbls[0].string = '击败';
                CellQuest.lbl(lbls[1], petStr, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], '获取', cc.color(173, 173, 173));
                CellQuest.lbl(lbls[3], need.name, cc.Color.BLUE);
                CellQuest.lbl(lbls[4], 'x ' + String(QuestTool.getRealCount(quest)), cc.Color.ORANGE);
                lbls[5].string = '';
                break;
            }
            case QuestType.gather: {
                const need = questModel.need as GatherQuestNeed;
                const posModel = actPosModelDict[need.posId];
                const explModel: ExplModel = posModel.actMDict[PAKey.expl] as ExplModel;
                const stepMax = explModel.stepMax;
                const stepType = StepTypesByMax[stepMax][need.step];
                const stepName = ExplStepNames[stepType];

                lbls[0].string = '前往';
                CellQuest.lbl(lbls[1], posModel.cnName, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], stepName, cc.Color.RED);
                CellQuest.lbl(lbls[3], '收集', cc.color(173, 173, 173));
                CellQuest.lbl(lbls[4], need.name, cc.Color.BLUE);
                CellQuest.lbl(lbls[5], 'x ' + String(QuestTool.getRealCount(quest)), cc.Color.ORANGE);
                break;
            }
            case QuestType.search: {
                const need = questModel.need as SearchQuestNeed;
                const posModel = actPosModelDict[need.posId];
                const explModel: ExplModel = posModel.actMDict[PAKey.expl] as ExplModel;
                const stepMax = explModel.stepMax;
                const stepType = StepTypesByMax[stepMax][need.step];
                const stepName = ExplStepNames[stepType];

                lbls[0].string = '前往';
                CellQuest.lbl(lbls[1], posModel.cnName, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], stepName, cc.Color.RED);
                CellQuest.lbl(lbls[3], '搜寻', cc.color(173, 173, 173));
                CellQuest.lbl(lbls[4], need.name, cc.Color.BLUE);
                lbls[5].string = '';
                break;
            }
        }
    }

    static lbl(lbl: cc.Label, str: string, c: cc.Color) {
        lbl.string = str;
        lbl.node.color = c;
    }

    static getQuestAwardStr(quest: Quest, questModel: QuestModel, lbls: cc.Label[]) {
        lbls[1].string = `声望${QuestTool.getRealReput(quest)}`;
        lbls[2].string = `通用币${MoneyTool.getSimpleStr(QuestTool.getRealMoney(quest))}`;
        let itemNames = '';
        const awardItemIds = questModel.awardItemIds;
        if (awardItemIds.length > 0) {
            for (let index = 0; ; index++) {
                const itemId = awardItemIds[index];
                const model = CnsumTool.getModelById(itemId);
                if (model) {
                    itemNames += model.cnName;
                } else {
                    const equip = EquipTool.createByFullId(itemId);
                    itemNames += EquipTool.getCnName(equip);
                }
                if (index === awardItemIds.length - 1) break;
                itemNames += ', ';
            }
            lbls[3].string = itemNames;
        }
    }

    onClick() {
        cc.log('PUT cell click: ', this.questModel.id, this.curCellIdx);
        if (this.clickCallback) this.clickCallback(this);
    }

    onClickFuncBtn() {
        cc.log('PUT show pet cell func: ', this.questModel.id, this.curCellIdx);
        if (this.funcBtnCallback) this.funcBtnCallback(this);
    }
}
