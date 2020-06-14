/*
 * PagePkgBase.ts
 * 可以使用PagePkgLVD的页面的基类
 * luleyan
 */

import PageBase from 'scripts/PageBase';
import ListViewCell from 'scripts/ListViewCell';

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class PagePkgBase extends PageBase {
    abstract onCellClick(cell: ListViewCell): void;
    abstract onCellClickFuncBtn(cell: ListViewCell): void;
}
