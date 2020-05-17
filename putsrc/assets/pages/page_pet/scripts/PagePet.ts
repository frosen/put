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

@ccclass
export default class PagePet extends PageBase {
    dirtyToken: number = 0;

    @property(cc.Node)
    funcBarNode: cc.Node = null;

    @property(cc.Node)
    touchLayer: cc.Node = null;

    funcBarShowIdx: number = -1;

    onInit() {
        this.getComponent(PagePetLVD).page = this;

        this.funcBarNode.opacity = 0;
        this.funcBarNode.y = 9999;

        this.touchLayer.on(cc.Node.EventType.TOUCH_START, this.hideFuncBar, this);
        // @ts-ignore
        this.touchLayer._touchListener.setSwallowTouches(false);
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
        this.showFuncBar(cell.curCellIdx, cell.node);
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

    showFuncBar(cellIdx: number, cellNode: cc.Node) {
        this.funcBarShowIdx = cellIdx;
        let wp = cellNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;

        realY -= 85;

        let changeBar = () => {
            this.funcBarNode.y = realY;
            let atBottom = this.funcBarShowIdx < 5;
            this.funcBarNode.getChildByName('arrow_node').scaleY = atBottom ? 1 : -1;
            this.funcBarNode.getChildByName('func_bar').y = atBottom ? -90 : 90;
        };

        this.funcBarNode.stopAllActions();
        if (this.funcBarShowIdx >= 0) {
            cc.tween(this.funcBarNode).to(0.1, { opacity: 0 }).call(changeBar).to(0.1, { opacity: 255 }).start();
        } else {
            changeBar();
            this.funcBarNode.opacity = 0;
            cc.tween(this.funcBarNode).to(0.1, { opacity: 255 }).start();
        }
    }

    hideFuncBar() {
        if (this.funcBarShowIdx >= 0) {
            this.funcBarShowIdx = -1;

            this.funcBarNode.stopAllActions();
            cc.tween(this.funcBarNode).to(0.1, { opacity: 0 }).set({ y: 9999 }).start();
        }
    }

    onMoveUpCell() {
        if (this.funcBarShowIdx < 0) return;
        let rzt = GameDataTool.movePetInList(this.ctrlr.memory.gameData, this.funcBarShowIdx, this.funcBarShowIdx - 1);
        if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
        this.hideFuncBar();
    }

    onMoveDownCell() {
        if (this.funcBarShowIdx < 0) return;
        let rzt = GameDataTool.movePetInList(this.ctrlr.memory.gameData, this.funcBarShowIdx, this.funcBarShowIdx + 1);
        if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
        this.hideFuncBar();
    }

    onRemoveCell() {
        if (this.funcBarShowIdx < 0) return;
        let idx = this.funcBarShowIdx;
        let pet = this.ctrlr.memory.gameData.pets[idx];
        let name = (petModelDict[pet.id] as PetModel).cnName;
        let str = `确定放生宠物“${name}”？ ` + '\n注意：放生后将无法找回！';
        this.ctrlr.popAlert(str, (key: number) => {
            if (key == 1) {
                let rzt = GameDataTool.deletePet(this.ctrlr.memory.gameData, idx);
                if (rzt == GameDataTool.SUC) this.getComponentInChildren(ListView).resetContent(true);
                else this.ctrlr.popToast(rzt);
            }
        });
        this.hideFuncBar();
    }
}
