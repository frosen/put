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
import CellAttri from 'pubcells/cell_attri/scripts/CellAttri';
import CellAttri2 from 'pubcells/cell_attri2/scripts/CellAttri2';
import CellPetName from '../cells/cell_pet_name/scripts/CellPetName';
import CellTitle from 'pubcells/cell_title/scripts/CellTitle';

@ccclass
export default class PagePetDetailLVD extends ListViewDelegate {
    @property(cc.Prefab)
    attriPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    attri2Prefab: cc.Prefab = null;

    @property(cc.Prefab)
    petNamePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    titlePrefab: cc.Prefab = null;

    gameData: GameData = null;

    numberOfRows(listView: ListView): number {
        return 13;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        switch (rowIdx) {
            case 0:
                return 206;
            case 1:
            case 2:
                return 106;
            case 3:
                return 126;
            case 4:
                return 106;
            case 5:
                return 126;
            case 6:
            case 7:
                return 106;
            case 8:
                return 126;
            case 9:
                return 106;
            case 10:
                return 126;
            case 11:
                return 66;
            case 12:
                return 106;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        switch (rowIdx) {
            case 0:
                return 'petName';
            case 1:
            case 2:
                return 'attri2';
            case 3:
                return 'attri';
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                return 'attri2';
            case 11:
                return 'title';
            case 12:
                return 'attri2';
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case 'petName':
                return cc.instantiate(this.petNamePrefab).getComponent(ListViewCell);
            case 'attri':
                return cc.instantiate(this.attriPrefab).getComponent(ListViewCell);
            case 'attri2':
                return cc.instantiate(this.attri2Prefab).getComponent(ListViewCell);
            case 'title':
                return cc.instantiate(this.titlePrefab).getComponent(ListViewCell);
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPetName & CellAttri & CellAttri2 & CellTitle) {
        switch (rowIdx) {
            case 0:
                cell.setData('发条机器人', 'aaa');
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
            case 6:
                cell.setData1('强壮', 'aaa');
                cell.setData2('专注', 'Me');
                break;
            case 7:
                cell.setData1('灵敏', 'aaa');
                cell.setData2('耐久', 'Me');
                break;
            case 8:
                cell.setData1('细腻', 'aaa');
                cell.setData2('优雅', 'Me');
                break;
            case 9:
                cell.setData1('HP', 'aaa');
                cell.setData2('MP', 'Me');
                break;
            case 10:
                cell.setData1('攻击伤害', 'aaa');
                cell.setData2('技能伤害', 'Me');
                break;
            case 11:
                cell.setData('宠物特性');
                break;
            case 12:
                cell.setData1('攻击伤害', 'aaa');
                cell.setData2('技能伤害', 'Me');
                break;
        }
    }
}
