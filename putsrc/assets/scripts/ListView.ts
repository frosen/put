/*
 * ListView.ts
 * 列表
 * luleyan
 */

const { ccclass, property, requireComponent } = cc._decorator;

import ListViewDelegate from './ListViewDelegate';
import ListViewCell from './ListViewCell';

class CellReuseData {
    using: boolean = false;
    cell: ListViewCell = null;
}

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

    reuseCells: { [key: string]: CellReuseData[] } = {};

    onLoad() {
        cc.assert(this.delegate, '未指定代理');

        this.scrollView = this.getComponent(cc.ScrollView);
        this.content = this.scrollView.content;

        this.createContent();
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
            this.disTopRowIdx = Math.floor(disTop / this.fixedHeight);
            this.disBtmRowIdx = Math.floor(disBtm / this.fixedHeight);
            this.disTopRowPos = this.disTopRowIdx * this.fixedHeight;
            this.disTopRowPos = this.disBtmRowIdx * this.fixedHeight;

            for (let rowIdx = this.disTopRowIdx; rowIdx <= this.disBtmRowIdx; rowIdx++) {
                let cell = this.createCell(rowIdx);
            }
        } else {
            this.disTopRowIdx = 0;
            this.disBtmRowIdx = this.rowCount - 1;
            let topDone = false;
            let curPos = 0;
            for (let rowIdx = 0; rowIdx < this.rowCount; rowIdx++) {
                curPos += this.delegate.heightForRow(this, rowIdx);
                if (curPos > disTop && !topDone) {
                    this.disTopRowIdx = rowIdx;
                    topDone = true;
                }
                if (curPos >= disBtm) {
                    this.disBtmRowIdx = rowIdx;
                    break;
                }
            }
        }

        let curPos = this.disTopRowPos;
        for (let rowIdx = this.disTopRowIdx; rowIdx <= this.disBtmRowIdx; rowIdx++) {
            let cellId = this.delegate.cellIdForRow(this, rowIdx);

            if (!this.reuseCells.hasOwnProperty(cellId)) {
                this.reuseCells[cellId] = [];
            }

            let reuseList = this.reuseCells[cellId];
            let noUseData = null;
            for (let cellReuseIdx = 0; cellReuseIdx < reuseList.length; cellReuseIdx++) {
                const cellReuseData = reuseList[cellReuseIdx];
                if (cellReuseData.using == false) {
                    noUseData = cellReuseData;
                    break;
                }
            }

            if (!noUseData) {
                let newData = new CellReuseData();
                newData.cell = this.delegate.createCellForRow(this, rowIdx);
                reuseList.push(newData);
                noUseData = newData;
            }

            noUseData.using = true;

            let cell = noUseData.cell;
            this.delegate.setCellForRow(this, rowIdx, cell);
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

    createCell(rowIdx: number): ListViewCell {
        let cellId = this.delegate.cellIdForRow(this, rowIdx);

        if (!this.reuseCells.hasOwnProperty(cellId)) {
            this.reuseCells[cellId] = [];
        }

        let reuseList = this.reuseCells[cellId];
        let noUseData = null;
        for (let cellReuseIdx = 0; cellReuseIdx < reuseList.length; cellReuseIdx++) {
            const cellReuseData = reuseList[cellReuseIdx];
            if (cellReuseData.using == false) {
                noUseData = cellReuseData;
                break;
            }
        }

        if (!noUseData) {
            let newData = new CellReuseData();
            let newCell = this.delegate.createCellForRow(this, rowIdx);
            newCell.node.parent = this.content;
            newData.cell = newCell;
            reuseList.push(newData);
            noUseData = newData;
        }

        noUseData.using = true;

        let cell = noUseData.cell;
        this.delegate.setCellForRow(this, rowIdx, cell);

        return cell;
    }
}
