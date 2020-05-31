/*
 * PagePet.ts
 * 宠物列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListView from 'scripts/ListView';
import PagePetLVD from './PagePetLVD';
import { petModelDict } from 'configs/PetModelDict';
import { GameDataTool } from 'scripts/Memory';
import { PetModel } from 'scripts/DataModel';
import { Pet, PetState } from 'scripts/DataSaved';
import { CellPetType, CellPet } from '../cells/cell_pet/scripts/CellPet';
import PagePetDetail from 'pages/page_pet_detail/scripts/PagePetDetail';
import PageBase from 'scripts/PageBase';
import FuncBar from '../prefabs/prefab_func_bar/scripts/FuncBar';

@ccclass
export default class PagePet extends PageBase {
    dirtyToken: number = 0;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null;

    funcBar: FuncBar = null;

    onLoad() {
        this.getComponent(PagePetLVD).page = this;

        let funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node;

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) },
            { str: '放生', callback: this.onRemoveCell.bind(this) }
        ]);
    }

    cellPetType: CellPetType = CellPetType.normal;
    specialPageName: string = null;
    needBackBtn: boolean = false;
    clickCallback: (index: number, pet: Pet) => void = null;

    /**
     * pagePetType
     * name
     * callback
     * pets
     */
    setData(data: any) {
        if (data) {
            this.cellPetType = data.cellPetType;
            this.specialPageName = data.name;
            this.clickCallback = data.callback;
            cc.assert(this.cellPetType, 'PUT 特别的宠物列表必须有类型');
            cc.assert(this.specialPageName, 'PUT 特别的宠物列表必须有名字');
            cc.assert(this.clickCallback, 'PUT 特别的宠物列表必须有回调');
            this.needBackBtn = true;
            if (data.pets) this.getComponent(PagePetLVD).setSpecialPets(data.pets);
        }
    }

    onPageShow() {
        this.ctrlr.setTitle(this.specialPageName || '宠物');
        this.ctrlr.setBackBtnEnabled(this.needBackBtn);

        if (this.cellPetType == CellPetType.normal) {
            let curDirtyToken = this.ctrlr.memory.dirtyToken;
            if (this.dirtyToken != curDirtyToken) {
                this.dirtyToken = curDirtyToken;
                this.getComponentInChildren(ListView).resetContent(true);
            }
        } else {
            this.getComponentInChildren(ListView).resetContent(true);
        }
    }

    // -----------------------------------------------------------------

    onCellClick(cell: CellPet) {
        if (this.cellPetType == CellPetType.normal) this.onCellClickDetailBtn(cell);
        else this.clickCallback(cell.curCellIdx, cell.curPet);
    }

    onCellClickStateBtn(cell: CellPet) {
        this.changePetState(cell.curPet);
    }

    onCellClickFuncBtn(cell: CellPet) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    onCellClickDetailBtn(cell: CellPet) {
        this.ctrlr.pushPage(PagePetDetail, cell.curPet);
    }

    // -----------------------------------------------------------------

    changePetState(pet: Pet) {
        pet.state = pet.state == PetState.rest ? PetState.ready : PetState.rest;
        GameDataTool.sortPetsByState(this.ctrlr.memory.gameData);
        this.getComponentInChildren(ListView).resetContent(true);
    }

    onMoveUpCell(cellIdx: number) {
        let rzt = GameDataTool.movePetInList(this.ctrlr.memory.gameData, cellIdx, cellIdx - 1);
        if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
    }

    onMoveDownCell(cellIdx: number) {
        let rzt = GameDataTool.movePetInList(this.ctrlr.memory.gameData, cellIdx, cellIdx + 1);
        if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
    }

    onRemoveCell(cellIdx: number) {
        let pet = this.ctrlr.memory.gameData.pets[cellIdx];
        let name = (petModelDict[pet.id] as PetModel).cnName;
        let str = `确定放生宠物“${name}”？ ` + '\n注意：放生后将无法找回！';
        this.ctrlr.popAlert(str, (key: number) => {
            if (key == 1) {
                let rzt = GameDataTool.deletePet(this.ctrlr.memory.gameData, cellIdx);
                if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
                else this.ctrlr.popToast(rzt);
            }
        });
    }
}
