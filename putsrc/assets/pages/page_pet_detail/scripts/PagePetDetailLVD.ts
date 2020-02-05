/*
 * PagePetDetailLVD.ts
 * 宠物信息页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import { GameData } from 'scripts/Memory';
import { BaseController } from 'scripts/BaseController';
import CellAttri from 'pubcells/cell_attri/scripts/CellAttri';
import CellAttri2 from 'pubcells/cell_attri2/scripts/CellAttri2';

@ccclass
export default class PagePetDetailLVD extends ListViewDelegate {
    @property(cc.Prefab)
    attriPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    attri2Prefab: cc.Prefab = null;

    gameData: GameData = null;

    init(ctrlr: BaseController) {
        this.gameData = ctrlr.memory.gameData;
    }

    numberOfRows(listView: ListView): number {
        return 6;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        switch (rowIdx) {
            case 0:
            case 1:
            case 2:
                return 106;
            case 3:
                return 126;
            case 4:
            case 5:
                return 106;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        switch (rowIdx) {
            case 0:
            case 1:
            case 2:
                return 'attri2';
            case 3:
                return 'attri';
            case 4:
            case 5:
                return 'attri2';
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case 'attri':
                return cc.instantiate(this.attriPrefab).getComponent(ListViewCell);
            case 'attri2':
                return cc.instantiate(this.attri2Prefab).getComponent(ListViewCell);
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellAttri & CellAttri2) {
        switch (rowIdx) {
            case 0:
                cell.setData1('宠物', 'aaa');
                cell.setData2('主人', 'Me');
                break;
            case 1:
                cell.setData1('等级', 'aaa');
                cell.setData2('品阶', 'Me');
                break;
            case 2:
                cell.setData1('默契值', 'aaa');
                cell.setData2('学习值', 'Me');
                break;
            case 3:
                cell.setData('当前经验', '357 / 777', 357 / 777);
                break;
            case 4:
                cell.setData1('生物类型', 'aaa');
                cell.setData2('元素类型', 'Me');
                break;
            case 5:
                cell.setData1('战斗类型', 'aaa');
                cell.setData2('速度', 'Me');
                break;
        }
    }
}
