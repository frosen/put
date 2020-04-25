/*
 * PagePetLVD.ts
 * 宠物列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewDelegate from 'scripts/ListViewDelegate';
import ListView from 'scripts/ListView';
import ListViewCell from 'scripts/ListViewCell';
import CellPet from '../cells/cell_pet/scripts/CellPet';
import PagePet from './PagePet';
import { Pet } from 'scripts/DataSaved';

@ccclass
export default class PagePetLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPetPrefab: cc.Prefab = null;

    get curPets(): Pet[] {
        if (!this._curPets) this._curPets = this.ctrlr.memory.gameDataS.pets;
        return this._curPets;
    }
    _curPets: Pet[] = null;

    page: PagePet = null;

    numberOfRows(listView: ListView): number {
        return this.curPets.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'pet';
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        let cell = cc.instantiate(this.cellPetPrefab).getComponent(CellPet);
        cell.page = this.page;
        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPet) {
        let pet: Pet = this.curPets[rowIdx];
        cell.setData(rowIdx, pet);
    }
}
