/*
 * PageSelfLVD.ts
 * 个人页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PAKey } from '../../../configs/ActPosModelDict';
import { ProTtlModelDict } from '../../../configs/ProTtlModelDict';
import { QuestModelDict } from '../../../configs/QuestModelDict';
import { GameData, PADQuester, Quest } from '../../../scripts/DataSaved';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { GameDataTool } from '../../../scripts/Memory';
import { CellQuest } from '../../page_act_quester/cells/cell_quest/scripts/CellQuest';
import { CellTitle } from '../../page_pet_detail/cells/cell_title/scripts/CellTitle';
import { CellProTtl } from '../cells/cell_pro_ttl/scripts/CellProTtl';
import { CellSelfBtn } from '../cells/cell_self_btn/scripts/CellSelfBtn';
import { PageSelf } from './PageSelf';

const INFO = 'i';
const BTN = 'b';
const TITLE = 't';
const TTL = 'p';
const QUEST = 'q';
const EVT = 'e';

@ccclass
export class PageSelfLVD extends ListViewDelegate {
    page!: PageSelf;

    @property(cc.Prefab)
    infoPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    btnPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    titlePrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    ttlPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    questPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    evtPrefab: cc.Prefab = null!;

    gameData!: GameData;

    ttlIds!: string[];

    ttlCellLen!: number;
    questCellLen!: number;
    evtCellLen!: number;

    initData() {
        const gameData = this.ctrlr.memory.gameData;

        this.ttlIds = Object.keys(gameData.proTtlDict);
        this.ttlIds.sort((a: string, b: string) => {
            const aModel = ProTtlModelDict[a];
            const bModel = ProTtlModelDict[b];

            const diff1 = aModel.proTtlType - bModel.proTtlType;
            if (diff1 !== 0) return diff1;

            if (aModel.order && bModel.order) {
                const diff2 = aModel.order - bModel.order;
                if (diff2 !== 0) return diff2;
            }

            return gameData.proTtlDict[b].gainTime - gameData.proTtlDict[a].gainTime;
        });

        this.ttlCellLen = this.ttlIds.length;
        this.questCellLen = gameData.acceQuestInfos.length;
        this.evtCellLen = Math.ceil((gameData.ongoingEvtIds.length + gameData.finishedEvtIds.length) * 0.5);
        this.gameData = gameData;
    }

    numberOfRows(listView: ListView): number {
        return 5 + this.ttlCellLen + this.questCellLen + this.evtCellLen;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (rowIdx === 0) return 604;
        else if (rowIdx === 1) return 226;
        else if (rowIdx === 2) return 64;
        else if (rowIdx < 2 + this.ttlCellLen) return 154;
        else if (rowIdx === 2 + this.ttlCellLen) return 176;
        else if (rowIdx === 3 + this.ttlCellLen) return 64;
        else if (rowIdx < 3 + this.ttlCellLen + this.questCellLen) return 334;
        else if (rowIdx === 3 + this.ttlCellLen + this.questCellLen) return 356;
        else if (rowIdx === 4 + this.ttlCellLen + this.questCellLen) return 64;
        else return 204;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (rowIdx === 0) return INFO;
        else if (rowIdx === 1) return BTN;
        else if (rowIdx === 2) return TITLE;
        else if (rowIdx <= 2 + this.ttlCellLen) return TTL;
        else if (rowIdx === 3 + this.ttlCellLen) return TITLE;
        else if (rowIdx <= 3 + this.ttlCellLen + this.questCellLen) return QUEST;
        else if (rowIdx === 4 + this.ttlCellLen + this.questCellLen) return TITLE;
        else return EVT;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case INFO:
                return cc.instantiate(this.infoPrefab).getComponent(ListViewCell);
            case BTN:
                const cell = cc.instantiate(this.btnPrefab).getComponent(CellSelfBtn);
                cell.page = this.page;
                return cell;
            case TITLE:
                return cc.instantiate(this.titlePrefab).getComponent(ListViewCell);
            case TTL:
                return cc.instantiate(this.ttlPrefab).getComponent(ListViewCell);
            case QUEST: {
                const cell: CellQuest = cc.instantiate(this.questPrefab).getComponent(CellQuest);
                cell.clickCallback = this.page.onClickQuest.bind(this.page);
                cell.funcBtn.node.opacity = 0;
                cell.funcBtn.interactable = false;
                return cell;
            }
            case EVT: {
                const cell = cc.instantiate(this.evtPrefab).getComponent(ListViewCell);
                return cell;
            }
            default:
                return undefined!;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellProTtl & CellQuest & CellTitle) {
        if (rowIdx === 0) {
        } else if (rowIdx === 1) {
        } else if (rowIdx === 2) {
            cell.setData(`个人称号（${this.ttlCellLen}）`);
        } else if (rowIdx <= 2 + this.ttlCellLen) {
            const idx = rowIdx - 2 - 1;
            const ttlId = this.ttlIds[idx];
            const proTtl = this.gameData.proTtlDict[ttlId];
            const model = ProTtlModelDict[ttlId];
            cell.setData(proTtl, model);
        } else if (rowIdx === 3 + this.ttlCellLen) {
            cell.setData(`当前任务（${this.questCellLen}）`);
        } else if (rowIdx <= 3 + this.ttlCellLen + this.questCellLen) {
            const idx = rowIdx - 3 - this.ttlCellLen - 1;
            const questInfo = this.gameData.acceQuestInfos[idx];
            const questModel = QuestModelDict[questInfo.questId];
            const quest = GameDataTool.getQuestByAcceQuestInfo(this.gameData, questInfo);
            cell.setData(questModel, quest!, questInfo);
        } else if (rowIdx === 4 + this.ttlCellLen + this.questCellLen) {
            cell.setData(`事件经历（${this.evtCellLen}）`);
        } else {
        }
    }
}
