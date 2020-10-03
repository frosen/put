/*
 * PageActQuester.ts
 * 任务中心页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { GameDataTool } from 'scripts/Memory';
import { PageBase } from 'scripts/PageBase';
import { NavBar } from 'scripts/NavBar';
import { ListView } from 'scripts/ListView';
import { PADQuester, Quest } from 'scripts/DataSaved';
import { PAKey, ActPosModel, QuesterModel } from 'scripts/DataModel';
import { actPosModelDict } from 'configs/ActPosModelDict';
import { randomInt } from 'scripts/Random';
import { deepCopy } from 'scripts/Utils';
import { PageActQuesterLVD } from './PageActQuesterLVD';
import { CellQuest } from '../cells/cell_quest/scripts/CellQuest';

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
        const posId = gameData.curPosId;

        const acceptedQuestDict: { [key: string]: Quest } = {};
        for (const usingQuest of gameData.quests) {
            if (usingQuest.posId === posId) acceptedQuestDict[usingQuest.questId] = usingQuest;
        }
        this.acceptedQuestDict = acceptedQuestDict;

        const pADQuester: PADQuester = GameDataTool.addPA(gameData, posId, PAKey.quester) as PADQuester;
        const now = Date.now();
        if (!pADQuester.updateTime || now > pADQuester.updateTime + QuesterUpdataInterval) {
            pADQuester.updateTime = now;
            this.resetCurQuestList(pADQuester, actPosModelDict[posId]);
        }
        this.pADQuester = pADQuester;

        const lvd = this.list.delegate as PageActQuesterLVD;
        lvd.page = this;
    }

    resetCurQuestList(pADQuester: PADQuester, posModel: ActPosModel) {
        const questerModel = posModel.actMDict[PAKey.quester] as QuesterModel;
        const questIdList = deepCopy(questerModel.questIdList);
        cc.assert(questIdList, `${posModel.id}的questIdList有问题`);
        const questCount = randomInt(2) + 3;

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

    onCellClick(cell: CellQuest) {}

    onCellClickFuncBtn(cell: CellQuest) {}
}
