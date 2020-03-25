/*
 * PageActExplCatchLVD.ts
 * 宠物捕捉列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import CellCatch from '../cells/cell_catch/scripts/CellCatch';
import { BattlePet } from 'pages/page_act_expl/scripts/BattleController';
import PageActExplCatch from './PageActExplCatch';

@ccclass
export default class PageActExplCatchLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPetPrefab: cc.Prefab = null;

    page: PageActExplCatch = null;
    battlePets: BattlePet[] = [];

    initListData(page: PageActExplCatch, battlePets: BattlePet[]) {
        this.page = page;
        this.battlePets = battlePets;
    }

    numberOfRows(listView: ListView): number {
        return this.battlePets.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'bPet';
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        let cell = cc.instantiate(this.cellPetPrefab).getComponent(CellCatch);
        cell.page = this.page;
        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellCatch) {
        let pet: BattlePet = this.battlePets[rowIdx];
        cell.setData(rowIdx, pet);
    }
}
