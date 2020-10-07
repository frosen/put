/*
 * PageActQuester.ts
 * 任务中心页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CnsumDataTool, EquipDataTool, GameDataTool, MoneyTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { ListView } from 'scripts/ListView';
import { Cnsum, GameData, ItemType, PADQuester, Quest } from 'scripts/DataSaved';
import { PAKey, ActPosModel, QuesterModel, QuestModel, QuestType, SupportQuestNeed } from 'scripts/DataModel';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { randomInt } from 'scripts/Random';
import { deepCopy } from 'scripts/Utils';
import { PageActQuesterLVD } from './PageActQuesterLVD';
import { CellQuest, QuestState } from '../cells/cell_quest/scripts/CellQuest';

export const QuesterUpdataInterval: number = 24 * 60 * 60 * 1000; // 更新间隔毫秒

@ccclass
export class PageActQuester extends PageBase {
    @property(ListView)
    list: ListView = null;

    pADQuester: PADQuester;
    acceptedQuestDict: { [key: string]: Quest };

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const gameData = this.ctrlr.memory.gameData;
        this.resetAcceptedQuestDict(gameData);
        this.resetPADQuester(gameData);

        const lvd = this.list.delegate as PageActQuesterLVD;
        lvd.page = this;
    }

    resetAcceptedQuestDict(gameData: GameData) {
        const acceptedQuestDict: { [key: string]: Quest } = {};
        for (const usingQuest of gameData.quests) {
            if (usingQuest.posId === gameData.curPosId) acceptedQuestDict[usingQuest.questId] = usingQuest;
        }
        this.acceptedQuestDict = acceptedQuestDict;
    }

    resetPADQuester(gameData: GameData) {
        const posId = gameData.curPosId;
        const pADQuester: PADQuester = GameDataTool.addPA(gameData, posId, PAKey.quester) as PADQuester;
        const now = Date.now();
        if (!pADQuester.updateTime || now > pADQuester.updateTime + QuesterUpdataInterval) {
            pADQuester.updateTime = now;
            this.resetCurQuestList(pADQuester, actPosModelDict[posId]);
        }
        this.pADQuester = pADQuester;
    }

    resetCurQuestList(pADQuester: PADQuester, posModel: ActPosModel) {
        const questerModel = posModel.actMDict[PAKey.quester] as QuesterModel;
        const questIdList = deepCopy(questerModel.questIdList);
        cc.assert(questIdList, `${posModel.id}的questIdList有问题`);
        const questCount = 5; //randomInt(2) + 3;

        pADQuester.questIds = Object.keys(this.acceptedQuestDict); // 已经接受的任务不会消失
        for (let index = 0; index < questCount; index++) {
            const questId = questIdList.splice(randomInt(questIdList.length), 1)[0];
            pADQuester.questIds.push(questId);
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(true);
        navBar.setTitle('任务发布栏');
    }

    onPageShow() {
        this.list.resetContent(true);
    }

    // -----------------------------------------------------------------

    onCellClick(cell: CellQuest) {
        switch (cell.state) {
            case QuestState.toAccept:
                this.acceptQuest(cell.questModel);
                break;
            case QuestState.toRefresh:
                this.refreshQuest(cell.questModel, cell.quest);
                break;
            case QuestState.toFinish:
                this.showFinishQuestTip(cell.questModel);
                break;
            case QuestState.toSubmit:
                this.submitQuest(cell.questModel, cell.quest);
                break;
        }
    }

    onCellClickFuncBtn(cell: CellQuest) {}

    acceptQuest(questModel: QuestModel) {
        const gameData = this.ctrlr.memory.gameData;
        GameDataTool.addQuest(gameData, questModel.id, gameData.curPosId);
        this.resetAcceptedQuestDict(gameData);
        this.list.resetContent(true);

        this.ctrlr.popToast(`接收任务 ${questModel.cnName}`);
    }

    refreshQuest(questModel: QuestModel, quest: Quest) {
        const need = questModel.need as SupportQuestNeed;
        const gameData = this.ctrlr.memory.gameData;

        const model = CnsumDataTool.getModelById(need.itemId);
        this.ctrlr.popAlert(`确定使用${need.count}个“${model.cnName}”\n完成任务 ${questModel.cnName}？`, (key: number) => {
            if (key !== 1) return;
            let needItem: Cnsum;
            let needItemIdx: number;
            for (let index = 0; index < gameData.items.length; index++) {
                const item = gameData.items[index];
                if (item.id !== need.itemId) continue;
                needItem = item as Cnsum;
                needItemIdx = index;
                break;
            }
            if (!needItem) {
                this.ctrlr.popToast('未在背包中找到对应的物品');
                return;
            }

            const realCount = Math.min(need.count, needItem.count);
            const rzt = GameDataTool.deleteItem(gameData, needItemIdx, realCount);
            if (rzt !== GameDataTool.SUC) {
                this.ctrlr.popToast(rzt);
                return;
            }

            quest.progress += realCount;

            if (quest.progress >= need.count) {
                this.ctrlr.popToast(`完成任务 ${questModel.cnName}`);
            } else {
                this.ctrlr.popToast(`任务完成度 ${quest.progress} / ${need.count}`);
            }

            this.resetAcceptedQuestDict(gameData);
            this.list.resetContent(true);
        });
    }

    showFinishQuestTip(questModel: QuestModel) {
        if (questModel.type === QuestType.fight || questModel.type === QuestType.fightRandom) {
            this.ctrlr.popToast('请击败对应精灵获取道具并完成任务');
        } else {
            this.ctrlr.popToast('请前往对应地点进行探索并完成任务');
        }
    }

    submitQuest(questModel: QuestModel, quest: Quest) {
        const gameData = this.ctrlr.memory.gameData;
        GameDataTool.handleMoney(gameData, money => (money.sum += questModel.awardMoney));
        GameDataTool.addReput(gameData, gameData.curPosId, questModel.awardReput);
        let tip = `声望 ${questModel.awardMoney}\n通古币 ${MoneyTool.getSimpleStr(questModel.awardMoney)}`;
        for (const itemId of questModel.awardItemIds) {
            const cnsumModel = CnsumDataTool.getModelById(itemId);
            if (cnsumModel) {
                GameDataTool.addCnsum(gameData, itemId);
                tip += cnsumModel.cnName + '\n';
            } else {
                const equip = EquipDataTool.createByFullId(itemId);
                GameDataTool.addEquip(gameData, equip);
                tip += EquipDataTool.getCnName(equip) + '\n';
            }
        }
        GameDataTool.deleteQuest(gameData, questModel.id, gameData.curPosId);
        this.pADQuester.questIds.splice(this.pADQuester.questIds.indexOf(questModel.id), 1);

        this.resetAcceptedQuestDict(gameData);
        this.list.resetContent(true);

        this.ctrlr.popToast(`完成任务 ${questModel.cnName}\n获得\n` + tip);
    }
}
