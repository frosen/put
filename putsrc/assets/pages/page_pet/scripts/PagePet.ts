/*
 * PagePet.ts
 * 精灵列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from '../../../scripts/ListView';
import { PagePetLVD, PagePetCellType } from './PagePetLVD';
import { GameDataTool, PetTool } from '../../../scripts/Memory';
import { Pet, PetState } from '../../../scripts/DataSaved';
import { CellPet } from '../cells/cell_pet/scripts/CellPet';
import { PagePetDetail } from '../../page_pet_detail/scripts/PagePetDetail';
import { PageBase } from '../../../scripts/PageBase';
import { FuncBar } from './FuncBar';
import { NavBar } from '../../../scripts/NavBar';

@ccclass
export class PagePet extends PageBase {
    dirtyToken: number = 0;

    @property(ListView)
    list: ListView = null!;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null!;

    funcBar!: FuncBar;

    onLoad() {
        super.onLoad();

        if (CC_EDITOR) return;
        this.getComponent(PagePetLVD).page = this;

        const funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) },
            { str: '放生', callback: this.onRemoveCell.bind(this) }
        ]);
    }

    specialPageName!: string;
    needBackBtn: boolean = false;
    clickCallback!: (index: number, pet: Pet) => void;

    /**
     * cellPetType
     * name
     * callback
     * pets
     */
    setData(pageData: any) {
        if (pageData) {
            const lvd = this.list.delegate as PagePetLVD;
            lvd.cellType = pageData.cellPetType;
            this.specialPageName = pageData.name;
            this.clickCallback = pageData.callback;
            cc.assert(lvd.cellType, 'PUT 特别的精灵列表必须有类型');
            cc.assert(this.specialPageName, 'PUT 特别的精灵列表必须有名字');
            cc.assert(this.clickCallback, 'PUT 特别的精灵列表必须有回调');
            this.needBackBtn = true;
            if (pageData.pets) lvd.setSpecialPets(pageData.pets);
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(this.needBackBtn);
        navBar.setTitle(this.specialPageName || '精灵');
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;
        this.navBar.setSubTitle(`${gameData.pets.length}/${GameDataTool.getPetCountMax(gameData)}`);

        const lvd = this.list.delegate as PagePetLVD;
        if (lvd.cellType === PagePetCellType.normal) {
            const curDirtyToken = this.ctrlr.memory.dirtyToken;
            if (this.dirtyToken !== curDirtyToken) {
                this.dirtyToken = curDirtyToken;
                this.list.resetContent(true);
            }
        } else {
            this.list.resetContent(true);
        }
    }

    // -----------------------------------------------------------------

    onCellClick(cell: CellPet) {
        this.clickCallback(cell.curCellIdx, cell.curPet);
    }

    onCellClickStateBtn(cell: CellPet) {
        this.changePetState(cell.curPet);
    }

    onCellClickFuncBtn(cell: CellPet) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    onCellClickDetailBtn(cell: CellPet) {
        this.ctrlr.pushPage(PagePetDetail, { pet: cell.curPet });
    }

    // -----------------------------------------------------------------

    changePetState(pet: Pet) {
        const gameData = this.ctrlr.memory.gameData;
        const withRzt = GameDataTool.checkPetWithMaster(gameData, pet);
        if (withRzt !== GameDataTool.SUC) {
            return this.ctrlr.popToast('无法变更！\n' + withRzt);
        }

        const readyLen = GameDataTool.getReadyPets(gameData).length;
        if (pet.state === PetState.rest && readyLen >= 5) {
            return this.ctrlr.popToast('无法改变状态！备战状态的精灵不得大于五只');
        }

        if (gameData.expl) {
            if (pet.state === PetState.ready && GameDataTool.getReadyPets(gameData).length <= 2) {
                return this.ctrlr.popToast('无法改变状态！探索中，备战状态的精灵不得少于两只');
            }

            if (gameData.expl.btl) {
                return this.ctrlr.popToast('无法改变状态！当前处于交战状态');
            }
        }

        pet.state = pet.state === PetState.rest ? PetState.ready : PetState.rest;
        GameDataTool.sortPetsByState(gameData);
        this.getComponentInChildren(ListView).resetContent(true);
    }

    onMoveUpCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const rzt = GameDataTool.movePetInList(gameData, cellIdx, cellIdx - 1);
        if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
        else this.ctrlr.popToast('无法变更！\n' + rzt);
    }

    onMoveDownCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const rzt = GameDataTool.movePetInList(gameData, cellIdx, cellIdx + 1);
        if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
        else this.ctrlr.popToast('无法变更！\n' + rzt);
    }

    onRemoveCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const pet = gameData.pets[cellIdx];

        const name = PetTool.getCnName(pet);
        const str = `确定放生精灵“${name}”吗？\n` + '注意：放生后将无法找回！';
        this.ctrlr.popAlert(str, (key: number) => {
            if (key === 1) {
                const rzt = GameDataTool.removePet(gameData, cellIdx);
                if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
                else this.ctrlr.popToast(rzt);
            }
        });
    }
}
