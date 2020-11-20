/*
 * PagePet.ts
 * 精灵列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListView } from 'scripts/ListView';
import { PagePetLVD, PagePetCellType } from './PagePetLVD';
import { GameDataTool, PetTool } from 'scripts/Memory';
import { Pet, PetState } from 'scripts/DataSaved';
import { CellPet } from '../cells/cell_pet/scripts/CellPet';
import { PagePetDetail } from 'pages/page_pet_detail/scripts/PagePetDetail';
import { PageBase } from 'scripts/PageBase';
import { FuncBar } from './FuncBar';
import { NavBar } from 'scripts/NavBar';
import { ExplUpdater } from 'scripts/ExplUpdater';

@ccclass
export class PagePet extends PageBase {
    dirtyToken: number = 0;

    @property(ListView)
    list: ListView = null;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null;

    funcBar: FuncBar = null;

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

    specialPageName: string = null;
    needBackBtn: boolean = false;
    clickCallback: (index: number, pet: Pet) => void = null;

    /**
     * cellPetType
     * name
     * callback
     * pets
     */
    setData(data: any) {
        if (data) {
            const lvd = this.list.delegate as PagePetLVD;
            lvd.cellType = data.cellPetType;
            this.specialPageName = data.name;
            this.clickCallback = data.callback;
            cc.assert(lvd.cellType, 'PUT 特别的精灵列表必须有类型');
            cc.assert(this.specialPageName, 'PUT 特别的精灵列表必须有名字');
            cc.assert(this.clickCallback, 'PUT 特别的精灵列表必须有回调');
            this.needBackBtn = true;
            if (data.pets) lvd.setSpecialPets(data.pets);
        }
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setBackBtnEnabled(this.needBackBtn);
        navBar.setTitle(this.specialPageName || '精灵');
    }

    onPageShow() {
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
        if (!this.checkMasterHere()) return;
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl) {
            if (pet.state === PetState.ready && GameDataTool.getReadyPets(gameData).length <= 2) {
                return this.ctrlr.popToast('无法改变状态！探索中，备战状态的精灵不得少于两只');
            }

            if (gameData.curExpl.curBattle) {
                return this.ctrlr.popToast('无法改变状态！当前处于交战状态');
            }
        }

        pet.state = pet.state === PetState.rest ? PetState.ready : PetState.rest;
        GameDataTool.sortPetsByState(gameData);
        this.getComponentInChildren(ListView).resetContent(true);
    }

    onMoveUpCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        if (!this.checkMasterHere(gameData.pets[cellIdx])) return;

        const rzt = GameDataTool.movePetInList(gameData, cellIdx, cellIdx - 1);
        if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
    }

    onMoveDownCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        if (!this.checkMasterHere(gameData.pets[cellIdx])) return;

        const rzt = GameDataTool.movePetInList(gameData, cellIdx, cellIdx + 1);
        if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
    }

    onRemoveCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const pet = gameData.pets[cellIdx];

        if (pet.state !== PetState.rest) {
            return this.ctrlr.popToast('无法放生非休息状态精灵！');
        }

        const name = PetTool.getCnName(pet);
        const str = `确定放生精灵“${name}”？\n` + '注意：放生后将无法找回！';
        this.ctrlr.popAlert(str, (key: number) => {
            if (key === 1) {
                const rzt = GameDataTool.removePet(gameData, cellIdx);
                if (rzt === GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
                else this.ctrlr.popToast(rzt);
            }
        });
    }

    checkMasterHere(pet: Pet = null): boolean {
        const gameData = this.ctrlr.memory.gameData;
        if (gameData.curExpl && gameData.curExpl.afb && (pet ? pet.state === PetState.ready : true)) {
            this.ctrlr.popToast('无法变更！\n精灵在战斗而训练师未与其在一起');
            return false;
        }
        return true;
    }
}
