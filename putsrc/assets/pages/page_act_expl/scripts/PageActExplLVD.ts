/*
 * PageActExplLVD.ts
 * 探索页面列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ListViewDelegate } from 'scripts/ListViewDelegate';
import { ListView } from 'scripts/ListView';
import { ListViewCell } from 'scripts/ListViewCell';
import { PageActExpl } from './PageActExpl';
import { CellExplLog } from '../cells/cell_expl_log/scripts/CellExplLog';

export class LblFrameData {
    lbl: cc.Label;
    frame: cc.SpriteFrame;
    width: number;
}

const RepeatLog = 'Repeat';
const RichLog = 'Rich';
const ALog = 'A';
const MLog = 'M';
const BLog = 'B';
const SLog = 'S';
const DLog = 'D';
const RdLog = 'Rd';
const CellIdsByLogType = ['', RepeatLog, RichLog, ALog, MLog, BLog, SLog, DLog, RdLog];

@ccclass
export class PageActExplLVD extends ListViewDelegate {
    @property(cc.Node)
    lblFrameBaseNode: cc.Node = null;

    lblFrameDict: { [key: string]: LblFrameData } = {};

    getFrameDataByString(str: string): LblFrameData {
        if (!this.lblFrameDict.hasOwnProperty(str)) {
            let newNode = new cc.Node(str);
            newNode.parent = this.lblFrameBaseNode;

            let lbl = newNode.addComponent(cc.Label);
            lbl.string = str;
            let frame = this.getLblFrame(lbl);
            cc.dynamicAtlasManager.insertSpriteFrame(frame);
            this.lblFrameDict[str] = { lbl, frame, width: newNode.width };
        }

        return this.lblFrameDict[str];
    }

    getLblFrame(lbl: cc.Label): cc.SpriteFrame {
        // @ts-ignore
        lbl._assembler.updateRenderData(lbl);
        // @ts-ignore
        let frame = lbl._frame;
        let texture = frame._texture;

        let newFrame = new cc.SpriteFrame();
        newFrame.setTexture(texture);

        return newFrame;
    }

    clear() {
        cc.dynamicAtlasManager.reset();
    }

    // -----------------------------------------------------------------

    page: PageActExpl = null;

    @property(cc.Prefab)
    repeatLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    richLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    atkLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    missLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    buffLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    stopLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    deadLogCellPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    roundLogCellPrefab: cc.Prefab = null;

    numberOfRows(listView: ListView): number {
        return Math.min(this.page.getLogs().length, 99);
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        let logDataList = this.page.getLogs();
        return CellIdsByLogType[logDataList[rowIdx].type];
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        switch (cellId) {
            case RepeatLog:
                return cc.instantiate(this.repeatLogCellPrefab).getComponent(ListViewCell);
            case RichLog:
                return cc.instantiate(this.richLogCellPrefab).getComponent(ListViewCell);
            case ALog:
                return cc.instantiate(this.atkLogCellPrefab).getComponent(ListViewCell);
            case MLog:
                return cc.instantiate(this.missLogCellPrefab).getComponent(ListViewCell);
            case BLog:
                return cc.instantiate(this.buffLogCellPrefab).getComponent(ListViewCell);
            case SLog:
                return cc.instantiate(this.stopLogCellPrefab).getComponent(ListViewCell);
            case DLog:
                return cc.instantiate(this.deadLogCellPrefab).getComponent(ListViewCell);
            case RdLog:
                return cc.instantiate(this.roundLogCellPrefab).getComponent(ListViewCell);

            default:
                break;
        }
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellExplLog) {
        let logList = this.page.getLogs();
        cell.setData(logList[logList.length - rowIdx - 1]);
    }
}
