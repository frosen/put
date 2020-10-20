/*
 * CellPetName.ts
 * 精灵名称项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';

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

    tip: string = '';

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.state.node.on(cc.Node.EventType.TOUCH_END, this.onClickState.bind(this));
        this.editBtn.on(cc.Node.EventType.TOUCH_END, this.onClickNameModifyBtn.bind(this));
    }

    setData(petName: string, subName: string, masterName: string, stateTip: string) {
        this.petName.string = petName;
        this.subName.string = subName;
        ListViewCell.rerenderLbl(this.petName);
        ListViewCell.rerenderLbl(this.subName);
        this.layout.updateLayout();
        this.state.string = '状态：' + masterName;
        this.tip = stateTip;
    }

    onClickState() {
        this.ctrlr.popToast(this.tip);
    }

    onClickNameModifyBtn() {
        if (this.subName.string) {
            this.ctrlr.popToast('已经取过名字！\n如果打算修改，需要用道具移除当前名字');
            return;
        }
    }
}
