/*
 * CellPet.ts
 * 宠物列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import PagePetDetail from 'pages/page_pet_detail/scripts/PagePetDetail';
import * as petModelDict from 'configs/PetModelDict';
import PagePet from 'pages/page_pet/scripts/PagePet';
import { Pet, PetRankNames, PetStateNames, PetState, EleType } from 'scripts/DataSaved';
import { PetModel } from 'scripts/DataModel';

@ccclass
export default class CellPet extends ListViewCell {
    @property(cc.Label)
    petNameLbl: cc.Label = null;

    @property(cc.Label)
    subLbl: cc.Label = null;

    @property(cc.Label)
    stateLbl: cc.Label = null;

    @property(cc.Sprite)
    petSp: cc.Sprite = null;

    @property(cc.Button)
    stateBtn: cc.Button = null;

    @property(cc.Button)
    funcBtn: cc.Button = null;

    curIdx: number = -1;
    curPet: Pet = null;

    page: PagePet = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.stateBtn.node.on('click', this.onClickStateBtn, this);
        this.funcBtn.node.on('click', this.onClickFuncBtn, this);
    }

    setData(idx: number, pet: Pet) {
        this.curIdx = idx;
        this.curPet = pet;
        let petModel: PetModel = petModelDict[pet.id];
        this.petNameLbl.string = petModel.cnName;
        this.subLbl.string = `等级：${pet.lv}   品阶：${PetRankNames[pet.rank]}   默契值：${pet.privity}`;
        this.stateLbl.string = PetStateNames[pet.state];
        this.stateBtn.interactable = pet.state == PetState.rest || pet.state == PetState.ready;
        this.petSp.node.color = CellPet.getPetHeadUI(petModel).color;
    }

    static getPetHeadUI(petModel: PetModel): { color: cc.Color } {
        switch (petModel.eleType) {
            case EleType.fire:
                return { color: cc.Color.RED };
            case EleType.water:
                return { color: cc.Color.BLUE };
            case EleType.air:
                return { color: cc.Color.CYAN };
            case EleType.earth:
                return { color: cc.Color.GREEN };
            case EleType.light:
                return { color: cc.Color.YELLOW };
            case EleType.dark:
                return { color: cc.Color.BLACK };
            default:
                break;
        }
    }

    onClick() {
        this.ctrlr.pushPage(PagePetDetail, this.curPet);
    }

    onClickStateBtn() {
        cc.log('PUT change state: ', this.petNameLbl.string, this.curIdx);
        this.page.changePetState(this.curPet);
    }

    onClickFuncBtn() {
        cc.log('PUT show pet cell func: ', this.petNameLbl.string, this.curIdx);
        this.page.showFuncBar(this.curIdx, this.node);
    }
}
