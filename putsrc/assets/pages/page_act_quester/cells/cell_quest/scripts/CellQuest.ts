/*
 * CellQuest.ts
 * 任务列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { petModelDict } from 'configs/PetModelDict';

import { Pet, PetRankNames, PetStateNames, EleColor, Quest } from 'scripts/DataSaved';
import { featureModelDict } from 'configs/FeatureModelDict';
import { CnsumDataTool, MoneyTool, PetDataTool } from 'scripts/Memory';
import {
    ExplStepNames,
    ExplStepType,
    FightQuestNeed,
    GatherQuestNeed,
    QuestModel,
    QuestType,
    SearchQuestNeed,
    SupportQuestNeed
} from 'scripts/DataModel';
import { actPosModelDict } from 'configs/ActPosModelDict';

@ccclass
export class CellQuest extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null;

    @property(cc.Label)
    stateLbl: cc.Label = null;

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

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(questModel: QuestModel, quest: Quest) {
        this.questModel = questModel;
        this.quest = quest;

        this.nameLbl.string = questModel.cnName;
        CellQuest.getQuestNeedStr(questModel, this.needLbls);
        CellQuest.getQuestAwardStr(questModel, this.awardLbls);
        this.detailLbl.string = questModel.descs[0] + '\n' + questModel.descs[1];

        if (!quest) {
            this.stateLbl.string = '（点击接受）';
        } else if (quest.progress >= questModel.need.count) {
            this.stateLbl.string = this.atQuester ? '（完成 点击提交）' : '（完成）';
        } else if (questModel.type === QuestType.support) {
            this.stateLbl.string = `${quest.progress}/${questModel.need.count}（点击刷新）`;
        } else {
            this.stateLbl.string = `${quest.progress}/${questModel.need.count}`;
        }

        CellQuest.rerenderLbl(this.nameLbl);
        for (const layout of this.layouts) layout.updateLayout();
    }

    static getQuestNeedStr(questModel: QuestModel, lbls: cc.Label[]) {
        switch (questModel.type) {
            case QuestType.support: {
                const need = questModel.need as SupportQuestNeed;
                const itemModel = CnsumDataTool.getModelById(need.itemId);

                lbls[0].string = '提供';
                CellQuest.lbl(lbls[1], itemModel.cnName, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], 'x ' + String(need.count), cc.Color.ORANGE);
                lbls[3].string = '';
                lbls[4].string = '';
                lbls[5].string = '';
                break;
            }
            case QuestType.fight:
            case QuestType.fightRandom: {
                const need = questModel.need as FightQuestNeed;

                let petStr = '';
                for (let index = 0; index < need.petIds.length; index++) {
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
                CellQuest.lbl(lbls[4], 'x ' + String(need.count), cc.Color.ORANGE);
                lbls[5].string = '';
                break;
            }
            case QuestType.gather: {
                const need = questModel.need as GatherQuestNeed;
                const posModel = actPosModelDict[need.posId];

                lbls[0].string = '在';
                CellQuest.lbl(lbls[1], posModel.cnName, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], ExplStepNames[need.step], cc.Color.RED);
                CellQuest.lbl(lbls[3], need.step === ExplStepType.center ? '收集' : '或更远 收集', cc.color(173, 173, 173));
                CellQuest.lbl(lbls[4], need.name, cc.Color.BLUE);
                CellQuest.lbl(lbls[5], 'x ' + String(need.count), cc.Color.ORANGE);
                break;
            }
            case QuestType.search: {
                const need = questModel.need as SearchQuestNeed;
                const posModel = actPosModelDict[need.posId];
                lbls[0].string = '在';
                CellQuest.lbl(lbls[1], posModel.cnName, cc.Color.BLUE);
                CellQuest.lbl(lbls[2], ExplStepNames[need.step], cc.Color.RED);
                CellQuest.lbl(lbls[3], need.step === ExplStepType.center ? '搜寻' : '或更远 搜寻', cc.color(173, 173, 173));
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

    static getQuestAwardStr(questModel: QuestModel, lbls: cc.Label[]) {
        lbls[1].string = `声望${String(questModel.awardReput)}`;
        lbls[2].string = `通古币${MoneyTool.getSimpleStr(questModel.awardMoney)}`;
        if (questModel.awardItemIds.length > 0) {
            // llytodo
        }
    }

    static rerenderLbl(lbl: cc.Label) {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
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
