/*
 * ListView.ts
 * 列表
 * luleyan
 */

const { ccclass, property, requireComponent } = cc._decorator;

import ListViewDelegate from './ListViewDelegate';
import ListViewCell from './ListViewCell';

@ccclass
@requireComponent(cc.ScrollView)
export default class ListView extends cc.Component {
    @property(ListViewDelegate)
    delegate: ListViewDelegate = null;

    @property({
        tooltip: '0为不固定宽度，使用delegate的heightForRow指定'
    })
    fixedHeight: number = 0;

    scrollView: cc.ScrollView = null;
    content: cc.Node = null;

    rowCount: number = 0;

    disTopRowIdx: number = 0;
    disBtmRowIdx: number = 0;

    disTopRowPos: number = 0;
    disBtmRowPos: number = 0;

    reuseCells: { [key: string]: ListViewCell[] } = {};

    onLoad() {
        cc.assert(this.delegate, '未指定代理');

        this.scrollView = this.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;

        this.createContent();

        this.node.on('scrolling', this.onScrolling.bind(this));
    }

    createContent() {
        // 计算content高度
        this.rowCount = this.delegate.numberOfRows(this);

        let contentH = 0;
        if (this.fixedHeight > 0) {
            contentH = this.fixedHeight * this.rowCount;
        } else {
            for (let rowIdx = 0; rowIdx < this.rowCount; rowIdx++) {
                contentH += this.delegate.heightForRow(this, rowIdx);
            }
        }

        this.content.height = contentH;

        // 显示cell
        let { disTop, disBtm } = this.calcDisplayArea();
        if (this.fixedHeight > 0) {
            this.disTopRowIdx = Math.max(Math.floor(disTop / this.fixedHeight), 0);
            this.disBtmRowIdx = Math.min(Math.floor(disBtm / this.fixedHeight), this.rowCount - 1);
            this.disTopRowPos = this.disTopRowIdx * this.fixedHeight;
            this.disBtmRowPos = this.disBtmRowIdx * this.fixedHeight;
            for (let rowIdx = this.disTopRowIdx; rowIdx <= this.disBtmRowIdx; rowIdx++) {
                let cell = this.getUnusedCell(rowIdx);
                this.setCellPos(cell, rowIdx * this.fixedHeight);
            }
        } else {
            this.disTopRowIdx = 0;
            this.disBtmRowIdx = this.rowCount - 1;
            let topDone = false;
            let curPos = 0;
            for (let rowIdx = 0; rowIdx < this.rowCount; rowIdx++) {
                let thisH = this.delegate.heightForRow(this, rowIdx);
                let nextPos = curPos + thisH;
                if (nextPos > disTop && !topDone) {
                    this.disTopRowIdx = rowIdx;
                    this.disTopRowPos = curPos;
                    topDone = true;
                }
                if (topDone) {
                    let cell = this.getUnusedCell(rowIdx);
                    this.setCellPos(cell, curPos);
                }
                if (nextPos >= disBtm) {
                    this.disBtmRowIdx = rowIdx;
                    this.disBtmRowPos = curPos;
                    break;
                }
                curPos = nextPos;
            }
        }
    }

    resetContent() {}

    /**
     * 区域为正数值，与实际position相反
     */
    calcDisplayArea(): { disTop: number; disBtm: number } {
        let y = this.content.y;
        return {
            disTop: y - 1,
            disBtm: y + this.node.height + 1
        };
    }

    getUnusedCell(rowIdx: number): ListViewCell {
        let cellId = this.delegate.cellIdForRow(this, rowIdx);

        if (!this.reuseCells.hasOwnProperty(cellId)) {
            this.reuseCells[cellId] = [];
        }

        let reuseList = this.reuseCells[cellId];

        let unusedCell = null;
        if (reuseList.length == 0) {
            unusedCell = this.delegate.createCellForRow(this, rowIdx);
            unusedCell.node.parent = this.content;
        } else {
            unusedCell = reuseList.pop();
        }

        this.delegate.setCellForRow(this, rowIdx, unusedCell);

        return unusedCell;
    }

    /**
     * 区域为正数值，与实际position相反
     */
    setCellPos(cell: ListViewCell, pos: number) {
        cell.node.y = -pos;
    }

    onScrolling() {
        cc.log('^_^!scrolling');
    }
}
