/*
 * ListView.ts
 * 列表
 * luleyan
 */

const { ccclass, property, requireComponent } = cc._decorator;

import { ListViewDelegate } from './ListViewDelegate';
import { ListViewCell } from './ListViewCell';

@ccclass
@requireComponent(cc.ScrollView)
export class ListView extends cc.Component {
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

    disCellDataDict: { [key: number]: { cell: ListViewCell; id: string } } = {};
    reuseCellsDict: { [key: string]: ListViewCell[] } = {};

    _touching: boolean = false;
    get touching() {
        return this._touching;
    }

    onLoad() {
        cc.assert(this.delegate, '未指定代理');

        this.scrollView = this.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;

        this.node.on('scrolling', this.onScrolling.bind(this));

        // 解决scrollview在奇怪的时候显示bar的问题 ------------------------------------------------

        const self = this;

        // @ts-ignore
        const oldFunc = this.scrollView.verticalScrollBar._setOpacity;
        // @ts-ignore
        this.scrollView.verticalScrollBar._setOpacity = function (opacity) {
            if (this.node)
                if (self._touching || opacity <= this.node.opacity) {
                    oldFunc.call(this, opacity);
                }
        };

        // @ts-ignore
        const oldPressFunc = this.scrollView._handlePressLogic;
        // @ts-ignore
        const oldReleaseFunc = this.scrollView._handleReleaseLogic;
        // @ts-ignore
        this.scrollView._handlePressLogic = function (touch) {
            oldPressFunc.call(this, touch);
            self._touching = true;
        };
        // @ts-ignore
        this.scrollView._handleReleaseLogic = function (touch) {
            oldReleaseFunc.call(this, touch);
            self._touching = false;
        };
    }

    createContent(pos: number = 0) {
        this.rowCount = this.delegate.numberOfRows(this);
        this.content.height = this.getHeight(this.rowCount);
        this.content.y = pos;

        // 显示cell
        const { disTop, disBtm } = this.calcDisplayArea();
        if (this.fixedHeight > 0) {
            this.disTopRowIdx = Math.max(Math.floor(disTop / this.fixedHeight), 0);
            this.disBtmRowIdx = Math.min(Math.floor(disBtm / this.fixedHeight), this.rowCount - 1);
            this.disTopRowPos = this.disTopRowIdx * this.fixedHeight;
            this.disBtmRowPos = this.disBtmRowIdx * this.fixedHeight;
            this.disTopRowH = this.fixedHeight;
            this.disBtmRowH = this.fixedHeight;
            for (let rowIdx = this.disTopRowIdx; rowIdx <= this.disBtmRowIdx; rowIdx++) {
                const cellData = this.getUnusedCellData(rowIdx);
                this.setCellPos(cellData.cell, rowIdx * this.fixedHeight);
                this.disCellDataDict[rowIdx] = cellData;
            }
        } else {
            this.disTopRowIdx = 0;
            this.disBtmRowIdx = this.rowCount - 1;
            let topDone = false;
            let curPos = 0;
            for (let rowIdx = 0; rowIdx < this.rowCount; rowIdx++) {
                const thisH = this.delegate.heightForRow(this, rowIdx);
                const nextPos = curPos + thisH;
                if (nextPos > disTop && !topDone) {
                    this.disTopRowIdx = rowIdx;
                    this.disTopRowPos = curPos;
                    this.disTopRowH = thisH;
                    topDone = true;
                }
                if (topDone) {
                    const cellData = this.getUnusedCellData(rowIdx);
                    this.setCellPos(cellData.cell, curPos);
                    this.disCellDataDict[rowIdx] = cellData;
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

    /** 计算content高度 */
    getHeight(cellIdx: number): number {
        let contentH = 0;
        if (this.fixedHeight > 0) {
            contentH = this.fixedHeight * cellIdx;
        } else {
            for (let rowIdx = 0; rowIdx < cellIdx; rowIdx++) {
                contentH += this.delegate.heightForRow(this, rowIdx);
            }
        }
        return contentH;
    }

    clearContent() {
        this.scrollView.stopAutoScroll();

        for (const rowIdx in this.disCellDataDict) {
            if (this.disCellDataDict.hasOwnProperty(rowIdx)) {
                const cell = this.disCellDataDict[rowIdx];
                // @ts-ignore
                this.reclaimCell(cell, rowIdx);
            }
        }
        this.disCellDataDict = {};

        this.rowCount = 0;

        this.content.y = 0;
        this.content.height = 0;

        this.disTopRowIdx = 0;
        this.disBtmRowIdx = 0;

        this.disTopRowPos = 0;
        this.disBtmRowPos = 0;

        this.disTopRowH = 0;
        this.disBtmRowH = 0;
    }

    resetContent(samePos: boolean = false) {
        const curY = samePos ? this.content.y : 0;
        this.clearContent();
        this.createContent(curY);
    }

    onScrolling() {
        const { disTop, disBtm } = this.calcDisplayArea();
        this.updateDisTopRowData(disTop);
        this.updateDisBtmRowData(disBtm);
    }

    updateDisTopRowData(disTop: number) {
        if (disTop < this.disTopRowPos) {
            if (this.disTopRowIdx > 0) {
                this.disTopRowIdx--;
                this.disTopRowH = this.getRowHeightOnScrolling(this.disTopRowIdx);
                this.disTopRowPos -= this.disTopRowH;

                const cellData = this.getUnusedCellData(this.disTopRowIdx);
                this.setCellPos(cellData.cell, this.disTopRowPos);
                this.disCellDataDict[this.disTopRowIdx] = cellData;

                return this.updateDisTopRowData(disTop);
            }
        } else if (this.disTopRowPos + this.disTopRowH <= disTop) {
            if (this.disTopRowIdx < this.rowCount - 1) {
                const cellData = this.disCellDataDict[this.disTopRowIdx];
                this.reclaimCell(cellData, this.disTopRowIdx);
                delete this.disCellDataDict[this.disTopRowIdx];

                this.disTopRowIdx++;
                this.disTopRowPos += this.disTopRowH;
                this.disTopRowH = this.getRowHeightOnScrolling(this.disTopRowIdx);

                return this.updateDisTopRowData(disTop);
            }
        }
    }

    updateDisBtmRowData(disBtm: number) {
        if (disBtm <= this.disBtmRowPos) {
            if (this.disBtmRowIdx > 0) {
                const cellData = this.disCellDataDict[this.disBtmRowIdx];
                this.reclaimCell(cellData, this.disBtmRowIdx);
                delete this.disCellDataDict[this.disBtmRowIdx];

                this.disBtmRowIdx--;
                this.disBtmRowH = this.getRowHeightOnScrolling(this.disBtmRowIdx);
                this.disBtmRowPos -= this.disBtmRowH;

                return this.updateDisBtmRowData(disBtm);
            }
        } else if (this.disBtmRowPos + this.disBtmRowH < disBtm) {
            if (this.disBtmRowIdx < this.rowCount - 1) {
                this.disBtmRowIdx++;
                this.disBtmRowPos += this.disBtmRowH;
                this.disBtmRowH = this.getRowHeightOnScrolling(this.disBtmRowIdx);

                const cellData = this.getUnusedCellData(this.disBtmRowIdx);
                this.setCellPos(cellData.cell, this.disBtmRowPos);
                this.disCellDataDict[this.disBtmRowIdx] = cellData;

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
        let disTop = this.content.y;
        let disBtm = disTop + this.node.height;
        if (disBtm > this.content.height) {
            const diff = disBtm - this.content.height;
            if (diff < disTop) {
                disTop -= diff;
                disBtm -= diff;
            } else {
                disTop = 0;
                disBtm = this.node.height;
            }
            this.content.y = disTop;
        }
        return { disTop, disBtm };
    }

    /**
     * 区域为正数值，与实际position相反
     */
    setCellPos(cell: ListViewCell, pos: number) {
        cell.node.y = -pos;
    }

    getUnusedCellData(rowIdx: number): { cell: ListViewCell; id: string } {
        const cellId = this.delegate.cellIdForRow(this, rowIdx);
        cc.assert(cellId, `cellIdForRow获取cell id不成功：${rowIdx}`);

        if (!this.reuseCellsDict.hasOwnProperty(cellId)) {
            this.reuseCellsDict[cellId] = [];
        }

        const reuseList = this.reuseCellsDict[cellId];
        let unusedCell: ListViewCell = null;
        if (reuseList.length === 0) {
            unusedCell = this.delegate.createCellForRow(this, rowIdx, cellId);
            cc.assert(unusedCell, `创建cell没有成功：${rowIdx}, ${cellId}`);
            unusedCell.node.parent = this.content;
        } else {
            unusedCell = reuseList.pop();
            unusedCell.node.active = true;
        }

        unusedCell.curCellIdx = rowIdx;
        this.delegate.setCellForRow(this, rowIdx, unusedCell);
        return { cell: unusedCell, id: cellId };
    }

    reclaimCell(cellData: { cell: ListViewCell; id: string }, rowIdx: number) {
        cellData.cell.node.active = false;
        const cellId = cellData.id;
        if (!this.reuseCellsDict.hasOwnProperty(cellId)) this.reuseCellsDict[cellId] = [];
        this.reuseCellsDict[cellId].push(cellData.cell);
    }

    isScrolling(): boolean {
        return this.scrollView.isScrolling() || this.scrollView.isAutoScrolling();
    }
}
