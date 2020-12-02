/*
 * PetUI.ts
 * 精灵的显示
 * luleyan
 */

const { ccclass, property } = cc._decorator;

@ccclass
export class PetUI extends cc.Component {
    @property(cc.Label)
    petName: cc.Label = null;

    @property(cc.Label)
    subName: cc.Label = null;

    @property(cc.Label)
    petLv: cc.Label = null;

    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;

    @property(cc.Label)
    petHP: cc.Label = null;

    @property(cc.Node)
    buffNode: cc.Node = null;

    @property(cc.Layout)
    layout: cc.Layout = null;
}
