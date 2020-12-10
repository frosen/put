/*
 * CellPetName.ts
 * 精灵名称项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { Pet, PetStateNames } from '../../../../../scripts/DataSaved';
import { ListViewCell } from '../../../../../scripts/ListViewCell';
import { GameDataTool, PetTool } from '../../../../../scripts/Memory';
import { PageBase } from '../../../../../scripts/PageBase';
import { sensitiveWords } from '../../../../../configs/SensitiveWords';
import { CellPet } from '../../../../page_pet/cells/cell_pet/scripts/CellPet';
import { PTKey } from '../../../../../scripts/DataModel';

@ccclass
export class CellPetName extends ListViewCell {
    @property(cc.Label)
    petName: cc.Label = null;

    @property(cc.Label)
    subName: cc.Label = null;

    @property(cc.Node)
    editBtn: cc.Node = null;

    @property(cc.Label)
    state: cc.Label = null;

    @property(cc.Layout)
    layout: cc.Layout = null;

    @property(cc.EditBox)
    editBox: cc.EditBox = null;

    @property(cc.Sprite)
    petIconBG: cc.Sprite = null;

    @property(cc.Sprite)
    petIcon: cc.Sprite = null;

    page: PageBase = null;

    curPet: Pet = null;
    tip: string = '';

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.state.node.on(cc.Node.EventType.TOUCH_END, this.onClickState.bind(this));
        this.editBtn.on(cc.Node.EventType.TOUCH_END, this.onClickNameModifyBtn.bind(this));

        this.initEditBox();
    }

    initEditBox() {
        const editBox = this.editBox;

        // @ts-ignore
        const editImpl = editBox._impl;
        let editWChange = false;
        this.schedule(() => {
            editImpl._w += editWChange ? 0.01 : -0.01;
            editWChange = !editWChange;
        }, 0);

        const editNode = editBox.node;

        editNode.on('editing-return', (editBox: cc.EditBox) => {
            if (this.checkEditBoxInput(editBox.string)) editBox.blur();
        });

        editNode.on('editing-did-ended', (editBox: cc.EditBox) => {
            if (this.checkEditBoxInput(editBox.string)) {
                this.handleEditBoxInput(editBox.string);
            }
        });
    }

    checkedStrDict: { [key: string]: boolean } = {};

    checkEditBoxInput(str: string): boolean {
        if (str.length === 0) return true;

        if (this.checkedStrDict.hasOwnProperty(str)) return true;

        const gameData = this.ctrlr.memory.gameData;
        const charMax = GameDataTool.hasProTtl(gameData, PTKey.JingLingWang) ? 4 : 2;
        if (str.length > charMax) {
            this.ctrlr.popToast('修改名称失败\n一般名字最多2个字符\n成为精灵王后最多4个字符');
            return false;
        }

        const wrongList = [];
        for (let index = 0; index < str.length; index++) {
            const element = str.charAt(index);
            if (!/[\u4e00-\u9fa5]/.test(element)) {
                wrongList.push(element);
            }
        }
        if (wrongList.length > 0) {
            this.ctrlr.popToast(`修改名称失败\n如下字符错误：\n${wrongList}\n名字只能用简体中文`);
            return false;
        }

        let sWord = null;
        for (const sensitiveWord of sensitiveWords) {
            if (str.includes(sensitiveWord)) {
                sWord = sensitiveWord;
                break;
            }
        }
        if (sWord) {
            this.ctrlr.popToast(`修改名称失败\n包含敏感词：\n${sWord}`);
            return false;
        }

        this.checkedStrDict[str] = true;
        return true;
    }

    handleEditBoxInput(str: string) {
        cc.log('PUT change pet name to', str);
        if (str.length > 0) {
            this.ctrlr.popAlert(`确定要把${PetTool.getBaseCnName(this.curPet)}的名字\n改成“${str}”？`, (key: number) => {
                if (key === 1) {
                    if (this.ctrlr.getCurPage() === this.page) {
                        this.curPet.nickname = str;
                        this.setName(this.curPet);
                        this.setEditBoxEnabled(false);
                    } else {
                        this.ctrlr.popToast('修改名称失败');
                    }
                } else {
                    if (this.ctrlr.getCurPage() === this.page) {
                        this.setEditBoxEnabled(false);
                    }
                }
            });
        } else {
            this.setEditBoxEnabled(false);
        }
    }

    setData(pet: Pet, stateTip: string) {
        this.curPet = pet;
        this.setName(pet);
        this.state.string = '状态：' + PetStateNames[pet.state];
        this.tip = stateTip;
    }

    setName(pet: Pet) {
        const petName = PetTool.getCnName(pet);
        const subName = pet.nickname ? '(' + PetTool.getBaseCnName(pet) + ')' : '';
        this.petName.string = petName;
        this.subName.string = subName;
        ListViewCell.rerenderLbl(this.petName);
        ListViewCell.rerenderLbl(this.subName);
        this.layout.updateLayout();

        const { img, color } = CellPet.getPetIcon(pet, this.ctrlr.runningImgMgr);
        this.petIcon.spriteFrame = img;
        this.petIconBG.node.color = color;
    }

    onClickState() {
        this.ctrlr.popToast(this.tip);
    }

    onClickNameModifyBtn() {
        if (this.subName.string) {
            this.ctrlr.popToast('已经取过名字！\n如果打算修改，需要用道具移除当前名字');
            return;
        }

        this.setEditBoxEnabled(true);
        this.editBox.focus();
    }

    setEditBoxEnabled(b: boolean) {
        if (b) {
            this.editBox.node.scaleX = 1;
            this.editBox.node.opacity = 255;
            this.layout.node.opacity = 0;
        } else {
            this.editBox.node.scaleX = 0;
            this.editBox.node.opacity = 0;
            this.layout.node.opacity = 255;
        }
    }
}
