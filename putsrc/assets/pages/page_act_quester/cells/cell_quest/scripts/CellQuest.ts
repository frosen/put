/*
 * CellQuest.ts
 * 任务列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { PetModelDict } from '../../../../../configs/PetModelDict';

import { AcceQuestInfo, Quest, QuestDLines } from '../../../../../scripts/DataSaved';
import { CnsumTool, EquipTool, MoneyTool, QuestTool } from '../../../../../scripts/Memory';
import {
    ExplModel,
    ExplStepNames,
    FightQuestNeed,
    GatherQuestNeed,
    OwnTtlQuestNeed,
    QuestModel,
    QuestType,
    SearchQuestNeed,
    StepTypesByMax,
    SupportQuestNeed
} from '../../../../../scripts/DataModel';
import { ActPosModelDict, PAKey } from '../../../../../configs/ActPosModelDict';
import { CellUpdateDisplay } from '../../../../page_act_eqpmkt/cells/cell_update_display/scripts/CellUpdateDisplay';
import { ProTtlModelDict } from '../../../../../configs/ProTtlModelDict';

export enum QuestState {
    toAccept = 1,
    toRefresh,
    toFinish,
    toSubmit
}

@ccclass
export class CellQuest extends ListViewCell {
    @property(cc.Label)
    nameLbl: cc.Label = null!;

    @property(cc.Label)
    stateLbl: cc.Label = null!;

    @property(cc.Label)
    tipLbl: cc.Label = null!;

    @property([cc.Label])
    needLbls: cc.Label[] = [];

    @property([cc.Label])
    awardLbls: cc.Label[] = [];

    @property(cc.Label)
    detailLbl: cc.Label = null!;

    @property(cc.Sprite)
    questSp: cc.Sprite = null!;

    @property(cc.Button)
    funcBtn: cc.Button = null!;

    @property(cc.Layout)
    layouts: cc.Layout[] = [];

    clickCallback?: (cell: CellQuest) => void;
    funcBtnCallback?: (cell: CellQuest) => void;

    atQuester: boolean = false;

    questModel!: QuestModel;
    quest!: Quest;
    acceQuestInfo!: AcceQuestInfo;

    state!: QuestState;

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
        CellQuest.handleQuestNeedLbls(quest, questModel, this.needLbls);
        CellQuest.handleQuestAwardLbls(quest, questModel, this.awardLbls);
        this.detailLbl.string = questModel.descs[0] + '\n' + questModel.descs[1];

        let stateStr: string;
        let tipStr: string;
        if (!acceQuestInfo) {
            this.state = QuestState.toAccept;
            stateStr = '';
            tipStr = '（点击接受）';
        } else if (quest.prog >= QuestTool.getRealCount(quest)) {
            this.state = QuestState.toSubmit;
            stateStr = '  完成';
            tipStr = this.atQuester ? '（点击提交）' : '';
        } else if (questModel.type === QuestType.support) {
            this.state = QuestState.toRefresh;
            stateStr = `  ${quest.prog} / ${QuestTool.getRealCount(quest)}`;
            tipStr = '（点击刷新）';
        } else if (questModel.type === QuestType.search) {
            this.state = QuestState.toFinish;
            stateStr = `  0 / 1`;
            tipStr = '';
        } else {
            this.state = QuestState.toFinish;
            stateStr = `  ${quest.prog} / ${QuestTool.getRealCount(quest)}`;
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

    static handleQuestNeedLbls(quest: Quest, questModel: QuestModel, lbls: cc.Label[]) {
        const strDatas = this.getQuestNeedStrDatas(quest, questModel);
        for (let index = 0; index < lbls.length; index++) {
            const lbl = lbls[index];
            const data = strDatas[index];
            if (data) {
                lbl.string = data.s;
                if (data.c) lbl.node.color = data.c;
            } else lbl.string = '';
        }
    }

    static getQuestNeedStrDatas(quest: Quest, questModel: QuestModel): { s: string; c?: cc.Color }[] {
        switch (questModel.type) {
            case QuestType.support: {
                const need = questModel.need as SupportQuestNeed;
                const itemModel = CnsumTool.getModelById(need.itemId)!;

                let list = [];
                list[list.length] = { s: '提供' };
                list[list.length] = { s: itemModel.cnName, c: cc.Color.BLUE };
                list[list.length] = { s: 'x ' + String(QuestTool.getRealCount(quest)), c: cc.Color.ORANGE };
                return list;
            }
            case QuestType.fight: {
                const need = questModel.need as FightQuestNeed;

                let petStr = '';
                for (let index = 0; ; index++) {
                    const petId = need.petIds[index];
                    const petModel = PetModelDict[petId];
                    petStr += petModel.cnName;
                    if (index === need.petIds.length - 1) break;
                    petStr += ', ';
                }

                let list = [];
                list[list.length] = { s: '击败' };
                list[list.length] = { s: petStr, c: cc.Color.BLUE };
                list[list.length] = { s: '获取', c: cc.color(173, 173, 173) };
                list[list.length] = { s: need.name, c: cc.Color.BLUE };
                list[list.length] = { s: 'x ' + String(QuestTool.getRealCount(quest)), c: cc.Color.ORANGE };
                return list;
            }
            case QuestType.gather: {
                const need = questModel.need as GatherQuestNeed;
                const posModel = ActPosModelDict[need.posId];
                const explModel: ExplModel = posModel.actMDict[PAKey.expl] as ExplModel;
                const stepMax = explModel.stepMax;
                const stepType = StepTypesByMax[stepMax][need.step];
                const stepName = ExplStepNames[stepType];

                let list = [];
                list[list.length] = { s: '前往' };
                list[list.length] = { s: posModel.cnName, c: cc.Color.BLUE };
                list[list.length] = { s: stepName, c: cc.Color.RED };
                list[list.length] = { s: '收集', c: cc.color(173, 173, 173) };
                list[list.length] = { s: need.name, c: cc.Color.BLUE };
                list[list.length] = { s: 'x ' + String(QuestTool.getRealCount(quest)), c: cc.Color.ORANGE };
                return list;
            }
            case QuestType.search: {
                const need = questModel.need as SearchQuestNeed;
                const posModel = ActPosModelDict[need.posId];
                const explModel: ExplModel = posModel.actMDict[PAKey.expl] as ExplModel;
                const stepMax = explModel.stepMax;
                const stepType = StepTypesByMax[stepMax][need.step];
                const stepName = ExplStepNames[stepType];

                let list = [];
                list[list.length] = { s: '前往' };
                list[list.length] = { s: posModel.cnName, c: cc.Color.BLUE };
                list[list.length] = { s: stepName, c: cc.Color.RED };
                list[list.length] = { s: '搜寻', c: cc.color(173, 173, 173) };
                list[list.length] = { s: need.name, c: cc.Color.BLUE };
                return list;
            }
            case QuestType.ownttl: {
                const need = questModel.need as OwnTtlQuestNeed;
                const id = need.ttlId;
                const proTtlModel = ProTtlModelDict[id];

                const name = typeof proTtlModel.cnName === 'string' ? proTtlModel.cnName : proTtlModel.cnName(need.data);

                let list = [];
                list[list.length] = { s: '拥有' };
                list[list.length] = { s: name, c: cc.Color.RED };
                list[list.length] = { s: '称号', c: cc.color(173, 173, 173) };
                return list;
            }
            default:
                return [];
        }
    }

    static handleQuestAwardLbls(quest: Quest, questModel: QuestModel, lbls: cc.Label[]) {
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
