/*
 * CellPet.ts
 * 宠物列表中的项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import ListViewCell from 'scripts/ListViewCell';
import PagePetDetail from 'pages/page_pet_detail/scripts/PagePetDetail';
import { EleType, PetRankNames, PetStateNames, Pet, PetModel } from 'scripts/Memory';
import * as petModelDict from 'configs/PetModelDict';

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
    funcBtn: cc.Button = null;

    curPet: Pet = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;
        this.funcBtn.node.on('click', this.onClickFunc, this);
    }

    setData(pet: Pet) {
        this.curPet = pet;
        let petModel: PetModel = petModelDict[pet.id];
        this.petNameLbl.string = petModel.cnName;
        this.subLbl.string = `等级：${pet.lv}   品阶：${PetRankNames[pet.rank]}   默契值：${pet.privity}`;
        this.stateLbl.string = PetStateNames[pet.state];

        switch (petModel.eleType) {
            case EleType.fire:
                this.petSp.node.color = cc.Color.RED;
                break;
            case EleType.water:
                this.petSp.node.color = cc.Color.BLUE;
                break;
            case EleType.air:
                this.petSp.node.color = cc.Color.CYAN;
                break;
            case EleType.earth:
                this.petSp.node.color = cc.Color.GREEN;
                break;
            case EleType.light:
                this.petSp.node.color = cc.Color.YELLOW;
                break;
            case EleType.dark:
                this.petSp.node.color = cc.Color.BLACK;
                break;
            default:
                break;
        }
    }

    onClick() {
        this.ctrlr.pushPage(PagePetDetail, this.curPet);
    }

    onClickFunc() {
        cc.log('PUT show pet cell func: ', this.petNameLbl.string);
    }
}
