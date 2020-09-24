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

    @property(cc.Label)
    state: cc.Label = null;

    tip: string = '';

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        this.state.node.on(cc.Node.EventType.TOUCH_END, this.onClickState.bind(this));
    }

    setData(petName: string, subName: string, masterName: string, stateTip: string) {
        this.petName.string = petName;
        this.subName.string = subName;
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
