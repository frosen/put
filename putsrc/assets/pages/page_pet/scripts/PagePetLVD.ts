/*
 * PagePetLVD.ts
 * 精灵列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { CellPet } from '../cells/cell_pet/scripts/CellPet';
import { PagePet } from './PagePet';
import { Pet } from 'scripts/DataSaved';

export enum PagePetCellType {
    normal = 1,
    selection
}

@ccclass
export class PagePetLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPetPrefab: cc.Prefab = null;

    get curPets(): Pet[] {
        if (!this._curPets) this._curPets = this.ctrlr.memory.gameData.pets;
        return this._curPets;
    }
    _curPets: Pet[] = null;

    page: PagePet = null;
    cellType: PagePetCellType = PagePetCellType.normal;

    setSpecialPets(pets: Pet[]) {
        this._curPets = pets;
    }

    numberOfRows(listView: ListView): number {
        return this.curPets.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'pet';
    }

    createCellForRow(listView: ListView, rowIdx: number): ListViewCell {
        const cell = cc.instantiate(this.cellPetPrefab).getComponent(CellPet);
        if (this.cellType === PagePetCellType.normal) {
            cell.clickCallback = this.page.onCellClickDetailBtn.bind(this.page);
            cell.funcBtnCallback = this.page.onCellClickFuncBtn.bind(this.page);
            cell.stateBtnCallback = this.page.onCellClickStateBtn.bind(this.page);
        } else {
            cell.changeFuncBtnImgToDetail();
            cell.clickCallback = this.page.onCellClick.bind(this.page);
            cell.funcBtnCallback = this.page.onCellClickDetailBtn.bind(this.page);
            cell.stateBtn.interactable = false;
        }

        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPet) {
        const pet: Pet = this.curPets[rowIdx];
        cell.setData(pet);
    }
}
