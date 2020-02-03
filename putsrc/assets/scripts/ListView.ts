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

    disTopRowH: number = 0;
    disBtmRowH: number = 0;

    disCellDict: { [key: number]: ListViewCell } = {};

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
            this.disTopRowH = this.fixedHeight;
            this.disBtmRowH = this.fixedHeight;
            for (let rowIdx = this.disTopRowIdx; rowIdx <= this.disBtmRowIdx; rowIdx++) {
                let cell = this.getUnusedCell(rowIdx);
                this.setCellPos(cell, rowIdx * this.fixedHeight);
                this.disCellDict[rowIdx] = cell;
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
                    this.disTopRowH = thisH;
                    topDone = true;
                }
                if (topDone) {
                    let cell = this.getUnusedCell(rowIdx);
                    this.setCellPos(cell, curPos);
                    this.disCellDict[rowIdx] = cell;
                }
                if (nextPos >= disBtm) {
                    this.disBtmRowIdx = rowIdx;
                    this.disBtmRowPos = curPos;
                    this.disBtmRowH = thisH;
                    break;
                }
                curPos = nextPos;
            }
        }
    }

    resetContent() {}

    onScrolling() {
        cc.log('^_^!scrolling', this.content.y);
        let scrollPos = this.content.y;
        if (scrollPos <= 0) return; // 差超过底边时return

        let { disTop, disBtm } = this.calcDisplayArea();
        this.updateDisTopRowData(disTop);
        this.updateDisBtmRowData(disBtm);
    }

    updateDisTopRowData(disTop: number) {
        if (disTop < this.disTopRowPos) {
            if (this.disTopRowIdx > 0) {
                this.disTopRowIdx--;
                this.disTopRowH = this.getRowHeightOnScrolling(this.disTopRowIdx);
                this.disTopRowPos -= this.disTopRowH;

                let cell = this.getUnusedCell(this.disTopRowIdx);
                this.setCellPos(cell, this.disTopRowPos);
                this.disCellDict[this.disTopRowIdx] = cell;

                return this.updateDisTopRowData(disTop);
            }
        } else if (this.disTopRowPos + this.disTopRowH <= disTop) {
            if (this.disTopRowIdx < this.rowCount - 1) {
                let cell = this.disCellDict[this.disTopRowIdx];
                this.reclaimCell(cell, this.disTopRowIdx);
                delete this.disCellDict[this.disTopRowIdx];

                this.disTopRowIdx++;
                this.disTopRowPos += this.disTopRowH;
                this.disTopRowH = this.getRowHeightOnScrolling(this.disTopRowIdx);

                return this.updateDisTopRowData(disTop);
            }
        }
    }

    updateDisBtmRowData(disBtm: number) {
        if (disBtm <= this.disBtmRowPos) {
            if (this.disTopRowIdx > 0) {
                let cell = this.disCellDict[this.disBtmRowIdx];
                this.reclaimCell(cell, this.disBtmRowIdx);
                delete this.disCellDict[this.disBtmRowIdx];

                this.disBtmRowIdx--;
                this.disBtmRowH = this.getRowHeightOnScrolling(this.disBtmRowIdx);
                this.disTopRowPos -= this.disTopRowH;

                return this.updateDisBtmRowData(disBtm);
            }
        } else if (this.disBtmRowPos + this.disBtmRowH < disBtm) {
            if (this.disTopRowIdx < this.rowCount - 1) {
                this.disBtmRowIdx++;
                this.disBtmRowPos += this.disBtmRowH;
                this.disBtmRowH = this.getRowHeightOnScrolling(this.disBtmRowIdx);

                let cell = this.getUnusedCell(this.disBtmRowIdx);
                this.setCellPos(cell, this.disBtmRowPos);
                this.disCellDict[this.disBtmRowIdx] = cell;

                return this.updateDisBtmRowData(disBtm);
            }
        }
    }

    getRowHeightOnScrolling(rowIdx: number): number {
        return this.fixedHeight > 0 ? this.fixedHeight : this.delegate.heightForRow(this, rowIdx);
    }

    /**
     * 区域为正数值，与实际position相反
     */
    calcDisplayArea(): { disTop: number; disBtm: number } {
        let y = this.content.y;
        return {
            disTop: y,
            disBtm: y + this.node.height
        };
    }

    /**
     * 区域为正数值，与实际position相反
     */
    setCellPos(cell: ListViewCell, pos: number) {
        cell.node.y = -pos;
    }

    getUnusedCell(rowIdx: number): ListViewCell {
        let cellId = this.delegate.cellIdForRow(this, rowIdx);

        if (!this.reuseCells.hasOwnProperty(cellId)) {
            this.reuseCells[cellId] = [];
        }

        let reuseList = this.reuseCells[cellId];

        let unusedCell: ListViewCell = null;
        if (reuseList.length == 0) {
            unusedCell = this.delegate.createCellForRow(this, rowIdx);
            unusedCell.node.parent = this.content;
        } else {
            unusedCell = reuseList.pop();
            unusedCell.node.active = true;
        }

        this.delegate.setCellForRow(this, rowIdx, unusedCell);

        return unusedCell;
    }

    reclaimCell(cell: ListViewCell, rowIdx: number) {
        cell.node.active = false;

        let cellId = this.delegate.cellIdForRow(this, rowIdx);
        if (!this.reuseCells.hasOwnProperty(cellId)) {
            this.reuseCells[cellId] = [];
        }
        this.reuseCells[cellId].push(cell);
    }
}
