/*
 * PageSelf.ts
 * 个人页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PageBase } from '../../../scripts/PageBase';
import { ListView } from '../../../scripts/ListView';
import { PanelSelfInfo } from './PanelSelfInfo';
import { PageSelfLVD } from './PageSelfLVD';
import { FuncBar } from '../../page_pet/scripts/FuncBar';
import { CellQuest } from '../../page_act_quester/cells/cell_quest/scripts/CellQuest';
import { ActPosModelDict, PAKey } from '../../../configs/ActPosModelDict';
import { PageStory } from '../../page_act_story/scripts/PageStory';
import { GameDataTool } from '../../../scripts/Memory';
import { PADQuester, Quest } from '../../../scripts/DataSaved';
import { QuestModelDict } from '../../../configs/QuestModelDict';
import { EvtModelDict } from '../../../configs/EvtModelDict';

@ccclass
export class PageSelf extends PageBase {
    navHidden: boolean = true;

    @property(ListView)
    listView: ListView = null!;
    lvd!: PageSelfLVD;

    @property(PanelSelfInfo)
    selfInfo: PanelSelfInfo = null!;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null!;

    funcBar!: FuncBar;

    dirtyToken: number = 0;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.lvd = this.listView.delegate as PageSelfLVD;
        this.lvd.page = this;

        this.listView.node.on(ListView.EventType.scrolling, this.onScrolling.bind(this));
        this.selfInfo.ctrlr = this.ctrlr;

        const funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([{ str: '删除', callback: this.removeQuest.bind(this) }]);
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;

        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken !== curDirtyToken) {
            this.dirtyToken = curDirtyToken;

            this.resetListview();
            this.selfInfo.setData(gameData);
        }
    }

    resetListview() {
        this.lvd.initData();
        this.listView.resetContent(true);
    }

    onScrolling() {
        const y = this.listView.content.y;
        this.selfInfo.onScrolling(y);
    }

    // -----------------------------------------------------------------

    onClickQuest(cell: CellQuest) {
        const gameData = this.ctrlr.memory.gameData;
        const questIdx = this.lvd.getQuestIdxByCellIdx(cell.curCellIdx);
        const qInfo = gameData.acceQuestInfos[questIdx];
        let from: string | undefined;
        if (qInfo.posId) {
            from = `任务来自地点“${ActPosModelDict[qInfo.posId].cnName}”`;
        } else {
            from = `任务来自事件“${EvtModelDict[qInfo.evtId!].cnName}”`;
        }

        this.ctrlr.popToast(from);
    }

    onClickQuestFuncBtn(cell: CellQuest) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    onClickEvt(evtId: string) {
        const gameData = this.ctrlr.memory.gameData;
        if (!gameData.evtDict[evtId] || gameData.ongoingEvtIds.includes(evtId)) {
            const posName = ActPosModelDict[gameData.evtDict[evtId].posId].cnName;
            this.ctrlr.popToast(`事件尚未结束\n只能从对应地点“${posName}”进入`);
        } else {
            this.ctrlr.pushPage(PageStory, { evtId });
        }
    }

    // -----------------------------------------------------------------

    removeQuest(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const questIdx = this.lvd.getQuestIdxByCellIdx(cellIdx);
        const qInfo = gameData.acceQuestInfos[questIdx];
        const questId = qInfo.questId;
        const model = QuestModelDict[questId];
        this.ctrlr.popAlert(`确定删除任务 ${model.cnName} 吗？`, (key: number) => {
            if (key === 1) {
                GameDataTool.removeAcceQuest(gameData, questId, qInfo.posId, qInfo.evtId);

                if (qInfo.posId) {
                    const posData = gameData.posDataDict[qInfo.posId];
                    const quests = (posData.actDict[PAKey.quester] as PADQuester).quests;

                    for (let index = 0; index < quests.length; index++) {
                        const qInList = quests[index];
                        if (qInList.id === questId) {
                            quests.splice(index, 1);
                            break;
                        }
                    }
                } else {
                    const evt = gameData.evtDict[qInfo.evtId!];
                    if (evt) delete evt.curQuest;
                }

                this.resetListview();
            }
        });
    }
}
