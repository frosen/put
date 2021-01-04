/*
 * PkgEquipPetLVD.ts
 * 装备页面的物品栏中物品列表
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { Equip, Pet } from '../../../scripts/DataSaved';
import { PagePkgEquip } from './PagePkgEquip';
import { CellPkgEquip } from '../../page_pkg/cells/cell_pkg_equip/scripts/CellPkgEquip';
import { CellPetBrief } from '../cells/cell_pet_brief/scripts/CellPetBrief';
import { CellPkgEquipBlank } from '../../page_pkg/cells/cell_pkg_equip_blank/scripts/CellPkgEquipBlank';

const PET_INFO = 'p';
const EQUIP = 'e';
const BLANK = 'b';

@ccclass
export class PkgEquipPetLVD extends ListViewDelegate {
    @property(cc.Prefab)
    cellPetBriefPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEquipPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    cellPkgEquipBlankPrefab: cc.Prefab = null;

    page: PagePkgEquip = null;

    dataList: { pet: Pet; equip: Equip; petIndex: number; equipIndex: number }[] = [];

    initListData(pets: Pet[]) {
        this.dataList.length = 0;
        for (let petIndex = 0; petIndex < pets.length; petIndex++) {
            const pet = pets[petIndex];
            this.dataList.push({ pet, equip: null, petIndex, equipIndex: -1 });
            for (let equipIndex = 0; equipIndex < pet.equips.length; equipIndex++) {
                const equip = pet.equips[equipIndex];
                this.dataList.push({ pet, equip, petIndex, equipIndex });
            }
        }
    }

    numberOfRows(listView: ListView): number {
        return this.dataList.length;
    }

    heightForRow(listView: ListView, rowIdx: number): number {
        if (this.dataList[rowIdx].equipIndex === -1) {
            return 60;
        } else {
            return 160;
        }
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        if (this.dataList[rowIdx].equipIndex === -1) {
            return PET_INFO;
        } else if (this.dataList[rowIdx].equip) {
            return EQUIP;
        } else {
            return BLANK;
        }
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        if (cellId === PET_INFO) {
            return cc.instantiate(this.cellPetBriefPrefab).getComponent(CellPetBrief);
        } else if (cellId === EQUIP) {
            const cell = cc.instantiate(this.cellPkgEquipPrefab).getComponent(CellPkgEquip);
            cell.changeFuncBtnImgToDetail();
            cell.clickCallback = this.page.onPetCellClick.bind(this.page);
            cell.funcBtnCallback = this.page.onPetCellClickFuncBtn.bind(this.page);
            return cell;
        } else if (cellId === BLANK) {
            const cell = cc.instantiate(this.cellPkgEquipBlankPrefab).getComponent(CellPkgEquipBlank);
            cell.clickCallback = this.page.onPetCellClick.bind(this.page);
            return cell;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellPkgEquip & CellPetBrief) {
        const data = this.dataList[rowIdx];
        if (data.equipIndex === -1) {
            const pet = data.pet;
            (cell as CellPetBrief).setData(pet);
        } else {
            const equip = data.equip;
            if (equip) (cell as CellPkgEquip).setData(-1, equip);
        }
    }
}
