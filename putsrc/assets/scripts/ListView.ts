/*
 * ListView.ts
 * 列表
 * luleyan
 */

const { ccclass, property, executeInEditMode, requireComponent } = cc._decorator;

import ListViewDelegate from './ListViewDelegate';

@ccclass
@executeInEditMode
@requireComponent(cc.ScrollView)
export default class ListView extends cc.Component {
    delegate: ListViewDelegate = null;

    scrollView: cc.ScrollView = null;
    content: cc.Node = null;

    onLoad() {
        if (CC_EDITOR) {
            this.scrollView = this.getComponent(cc.ScrollView);
            if (!this.delegate) {
                let delegate = this.getComponent(ListViewDelegate);
                if (delegate) this.delegate = delegate;
            }
            return;
        }

        this.scrollView = this.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;
    }
}
