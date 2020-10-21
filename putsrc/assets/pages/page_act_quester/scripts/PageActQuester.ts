/*
 * PageActQuester.ts
 * 任务中心页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CnsumDataTool, EquipDataTool, GameDataTool, MoneyTool, QuestDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { ListView } from 'scripts/ListView';
import { AcceQuestInfo, Cnsum, GameData, PADQuester, Quest, QuestAmplType, QuestDLines, QuestDLineType } from 'scripts/DataSaved';
import { PAKey, ActPosModel, QuesterModel, QuestModel, QuestType, SupportQuestNeed } from 'scripts/DataModel';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { getRandomOneInList, randomInt, randomRate } from 'scripts/Random';
import { PageActQuesterLVD } from './PageActQuesterLVD';
import { CellQuest, QuestState } from '../cells/cell_quest/scripts/CellQuest';
import { FuncBar } from 'pages/page_pet/prefabs/prefab_func_bar/scripts/FuncBar';
import { questModelDict } from 'configs/QuestModelDict';

export const QuesterUpdateInterval: number = 12 * 60 * 60 * 1000; // 更新间隔毫秒
export const QuesterReuseInterval: number = 24 * 60 * 60 * 1000; // 重新可用间隔毫秒

@ccclass
export class PageActQuester extends PageBase {
    @property(ListView)
    list: ListView = null;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null;

    funcBar: FuncBar = null;

    acceQuestDict: { [key: string]: AcceQuestInfo };
    pADQuester: PADQuester;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([{ str: '删除', callback: this.deleteQuest.bind(this) }]);

        const gameData = this.ctrlr.memory.gameData;
        this.resetAcceptedQuestDict(gameData);
        this.resetPADQuester(gameData);

        const lvd = this.list.delegate as PageActQuesterLVD;
        lvd.page = this;
    }

    resetAcceptedQuestDict(gameData: GameData) {
        const acceptedQuestDict: { [key: string]: AcceQuestInfo } = {};
        for (const acceQuestInfo of gameData.acceQuestInfos) {
            if (acceQuestInfo.posId === gameData.curPosId) acceptedQuestDict[acceQuestInfo.questId] = acceQuestInfo;
        }
        this.acceQuestDict = acceptedQuestDict;
    }

    resetPADQuester(gameData: GameData) {
        const posId = gameData.curPosId;
        const pADQuester: PADQuester = GameDataTool.addPA(gameData, posId, PAKey.quester) as PADQuester;
        const now = Date.now();

        const doneTimeDict = pADQuester.doneTimeDict;
        for (const questId in doneTimeDict) {
            if (!doneTimeDict.hasOwnProperty(questId)) continue;
            if (now > doneTimeDict[questId] + QuesterReuseInterval) delete doneTimeDict[questId];
        }

        if (!pADQuester.updateTime || now > pADQuester.updateTime + QuesterUpdateInterval) {
            pADQuester.updateTime = now;
            this.resetCurQuestList(pADQuester, actPosModelDict[posId]);
        }
        this.pADQuester = pADQuester;
    }

    resetCurQuestList(pADQuester: PADQuester, posModel: ActPosModel) {
        const questerModel = posModel.actMDict[PAKey.quester] as QuesterModel;
        const doneTimeDict = pADQuester.doneTimeDict;
        const questIdList = [];
        for (const questId of questerModel.questIdList) {
            if (doneTimeDict.hasOwnProperty(questId)) continue;
            questIdList.push(questId);
        }

        const savedQuests = [];
        for (let index = 0; index < pADQuester.quests.length; index++) {
            const quest = pADQuester.quests[index];
            if (this.acceQuestDict.hasOwnProperty(quest.id)) savedQuests.push(quest);
        }
        pADQuester.quests = savedQuests; // 已经接受的任务不会消失

        const questCount = randomInt(4) + 3;
        for (let index = 0; index < questCount; index++) {
            if (questIdList.length === 0) break;
            const questId = questIdList.splice(randomInt(questIdList.length), 1)[0];
            let dLine: QuestDLineType;
            if (randomRate(0.3)) dLine = getRandomOneInList([QuestDLineType.in3h, QuestDLineType.in6h]);
            else dLine = 0;
            let ampl: QuestAmplType;
            if (randomRate(0.3)) ampl = getRandomOneInList([QuestAmplType.ampl, QuestAmplType.double]);
            else ampl = 0;
            pADQuester.quests.push(QuestDataTool.create(questId, dLine, ampl));
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

    onCellClickFuncBtn(cell: CellQuest) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    acceptQuest(questModel: QuestModel) {
        const gameData = this.ctrlr.memory.gameData;
        const rzt = GameDataTool.addAcceQuest(gameData, questModel.id, gameData.curPosId);
        if (rzt !== GameDataTool.SUC) {
            this.ctrlr.popToast(rzt);
            return;
        }
        this.resetAcceptedQuestDict(gameData);
        this.list.resetContent(true);

        this.ctrlr.popToast(`接收任务 ${questModel.cnName}`);
    }

    refreshQuest(questModel: QuestModel, quest: Quest) {
        const need = questModel.need as SupportQuestNeed;
        const gameData = this.ctrlr.memory.gameData;

        const model = CnsumDataTool.getModelById(need.itemId);
        const count = QuestDataTool.getRealCount(quest);
        this.ctrlr.popAlert(`确定使用${count}个“${model.cnName}”\n完成任务 ${questModel.cnName}？`, (key: number) => {
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

            const realCount = Math.min(count, needItem.count);
            const rzt = GameDataTool.deleteItem(gameData, needItemIdx, realCount);
            if (rzt !== GameDataTool.SUC) {
                this.ctrlr.popToast(rzt);
                return;
            }

            quest.progress += realCount;

            if (quest.progress >= count) {
                this.ctrlr.popToast(`完成任务 ${questModel.cnName}`);
            } else {
                this.ctrlr.popToast(`任务完成度 ${quest.progress} / ${count}`);
            }

            this.resetAcceptedQuestDict(gameData);
            this.list.resetContent(true);
        });
    }

    showFinishQuestTip(questModel: QuestModel) {
        if (questModel.type === QuestType.fight) {
            this.ctrlr.popToast('请击败对应精灵 获取道具 完成任务');
        } else {
            this.ctrlr.popToast('请前往对应地点 进行探索 完成任务');
        }
    }

    submitQuest(questModel: QuestModel, quest: Quest) {
        const gameData = this.ctrlr.memory.gameData;

        let awardMoney = QuestDataTool.getRealMoney(quest);
        let awardReput = QuestDataTool.getRealReput(quest);

        const timeOut = quest.dLine ? Date.now() - quest.startTime > QuestDLines[quest.dLine] : false;
        if (timeOut) {
            awardMoney = Math.floor(awardMoney * 0.1);
            awardReput = Math.floor(awardReput * 0.1);
        }

        GameDataTool.handleMoney(gameData, money => (money.sum += awardMoney));
        GameDataTool.addReput(gameData, gameData.curPosId, awardReput);
        let tip = `声望 ${awardReput}\n通用币 ${MoneyTool.getSimpleStr(awardMoney)}`;
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

        GameDataTool.deleteAcceQuest(gameData, questModel.id, gameData.curPosId);
        for (let index = 0; index < this.pADQuester.quests.length; index++) {
            const quest = this.pADQuester.quests[index];
            if (quest.id === questModel.id) {
                this.pADQuester.quests.splice(index, 1);
                break;
            }
        }
        this.pADQuester.doneTimeDict[questModel.id] = Date.now();

        this.resetAcceptedQuestDict(gameData);
        this.list.resetContent(true);

        this.ctrlr.popToast(`${timeOut ? '超时！！\n' : ''}完成任务 ${questModel.cnName}\n获得\n` + tip);
    }

    deleteQuest(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const quest = this.pADQuester.quests[cellIdx - 1];
        const questId = quest.id;
        const model = questModelDict[questId];
        this.ctrlr.popAlert(`确定删除任务 ${model.cnName} 吗`, (key: number) => {
            if (key === 1) {
                GameDataTool.deleteAcceQuest(gameData, questId, gameData.curPosId);
                // 根据id重新查找，以免出现冲突
                for (let index = 0; index < this.pADQuester.quests.length; index++) {
                    const qInList = this.pADQuester.quests[index];
                    if (qInList.id === questId) {
                        this.pADQuester.quests.splice(index, 1);
                        break;
                    }
                }

                this.resetAcceptedQuestDict(gameData);
                this.list.resetContent(true);
            }
        });
    }
}
