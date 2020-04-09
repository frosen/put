/*
 * PagePet.ts
 * 宠物列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PagePetLVD from './PagePetLVD';
import { Pet, PetState, PetModel } from 'scripts/Memory';
import * as petModelDict from 'configs/PetModelDict';

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

    onPageShow() {
        this.ctrlr.setTitle('宠物');

        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        if (this.dirtyToken != curDirtyToken) {
            this.dirtyToken = curDirtyToken;
            this.getComponentInChildren(ListView).resetContent(true);
        }
    }

    showFuncBar(cellIdx: number, cellNode: cc.Node) {
        this.funcBarShowIdx = cellIdx;
        let wp = cellNode.convertToWorldSpaceAR(cc.v2(0, 0));
        let realY = cc.v2(this.node.convertToNodeSpaceAR(wp)).y;

        realY -= 85;

        let changeBar = () => {
            this.funcBarNode.y = realY;
            let atBottom = this.funcBarShowIdx < 2;
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
        this.ctrlr.memory.moveUpPetInList(this.funcBarShowIdx);
        this.getComponentInChildren(ListView).resetContent(true);
        this.hideFuncBar();
    }

    onMoveDownCell() {
        if (this.funcBarShowIdx < 0) return;
        this.ctrlr.memory.moveDownPetInList(this.funcBarShowIdx);
        this.getComponentInChildren(ListView).resetContent(true);
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
                this.ctrlr.memory.deletePet(idx);
                this.getComponentInChildren(ListView).resetContent(true);
            }
        });
        this.hideFuncBar();
    }

    changePetState(pet: Pet) {
        pet.state = pet.state == PetState.rest ? PetState.ready : PetState.rest;
        this.ctrlr.memory.sortPetsByState();
        this.getComponentInChildren(ListView).resetContent(true);
    }
}
