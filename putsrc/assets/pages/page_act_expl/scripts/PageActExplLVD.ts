/*
 * PageActExplLVD.ts
 * 探索页面列表代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;
import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { PageActExpl } from './PageActExpl';
import { CellLogBase } from './CellLogBase';
import { rerenderLbl } from '../../../scripts/Utils';

export class LblFrameData {
    lbl!: cc.Label;
    frame!: cc.SpriteFrame;
    width!: number;
}

const RepeatLog = 'Repeat';
const RichLog = 'Rich';
const ALog = 'A';
const MLog = 'M';
const BLog = 'B';
const BHLog = 'BH';
const SLog = 'S';
const DLog = 'D';
const RdLog = 'Rd';
const CellIdsByLogType = ['', RepeatLog, RichLog, ALog, MLog, BLog, BHLog, SLog, DLog, RdLog];
const BLANK = 'bl';

cc.macro.CLEANUP_IMAGE_CACHE = false;
cc.dynamicAtlasManager.enabled = true;

@ccclass
export class PageActExplLVD extends ListViewDelegate {
    @property(cc.Node)
    lblFrameBaseNode: cc.Node = null!;

    lblFrameDict: { [key: string]: LblFrameData } = {};

    setSpByString(sp: cc.Sprite, str?: string, color?: cc.Color) {
        if (str) {
            const data = this.getFrameDataByString(str);
            sp.spriteFrame = data.frame;
            sp.node.width = data.width;
            if (color) sp.node.color = color;
        } else {
            sp.spriteFrame = null!;
            sp.node.width = 0;
        }
    }

    getFrameDataByString(str: string): LblFrameData {
        if (!this.lblFrameDict.hasOwnProperty(str)) {
            const newNode = new cc.Node(str);
            newNode.setAnchorPoint(0, 0.5);
            newNode.parent = this.lblFrameBaseNode;

            const lbl = newNode.addComponent(cc.Label);
            lbl.verticalAlign = cc.Label.VerticalAlign.CENTER;
            lbl.fontSize = 35;
            lbl.lineHeight = 50;
            lbl.string = str;
            const frame = this.getLblFrame(lbl);
            cc.dynamicAtlasManager.insertSpriteFrame(frame);
            this.lblFrameDict[str] = { lbl, frame, width: newNode.width };
        }

        return this.lblFrameDict[str];
    }

    getLblFrame(lbl: cc.Label): cc.SpriteFrame {
        rerenderLbl(lbl);
        // @ts-ignore
        const frame = lbl._frame;
        const texture = frame._texture;

        const newFrame = new cc.SpriteFrame();
        newFrame.setTexture(texture);

        return newFrame;
    }

    onDestroy() {
        cc.dynamicAtlasManager.reset();
    }

    // -----------------------------------------------------------------

    page!: PageActExpl;

    @property(cc.Prefab)
    repeatLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    richLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    atkLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    missLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    buffLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    buffHurtLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    stopLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    deadLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    roundLogCellPrefab: cc.Prefab = null!;

    @property(cc.Prefab)
    blankLogCellPrefab: cc.Prefab = null!;

    numberOfRows(listView: ListView): number {
        return Math.min(this.page.getLogs().length, 99) + 8; // 多个blank占一个屏幕
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        const logList = this.page.getLogs();
        if (rowIdx < logList.length) return CellIdsByLogType[logList[logList.length - rowIdx - 1].type];
        else return BLANK;
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        const cell: CellLogBase = this.getCellClassByCellId(cellId);
        cell.init(this);
        return cell;
    }

    getCellClassByCellId(cellId: string): CellLogBase {
        switch (cellId) {
            case RepeatLog:
                return cc.instantiate(this.repeatLogCellPrefab).getComponent(CellLogBase);
            case RichLog:
                return cc.instantiate(this.richLogCellPrefab).getComponent(CellLogBase);
            case ALog:
                return cc.instantiate(this.atkLogCellPrefab).getComponent(CellLogBase);
            case MLog:
                return cc.instantiate(this.missLogCellPrefab).getComponent(CellLogBase);
            case BLog:
                return cc.instantiate(this.buffLogCellPrefab).getComponent(CellLogBase);
            case BHLog:
                return cc.instantiate(this.buffHurtLogCellPrefab).getComponent(CellLogBase);
            case SLog:
                return cc.instantiate(this.stopLogCellPrefab).getComponent(CellLogBase);
            case DLog:
                return cc.instantiate(this.deadLogCellPrefab).getComponent(CellLogBase);
            case RdLog:
                return cc.instantiate(this.roundLogCellPrefab).getComponent(CellLogBase);
            case BLANK:
                return cc.instantiate(this.blankLogCellPrefab).getComponent(CellLogBase);
        }
        return undefined!;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellLogBase) {
        const logList = this.page.getLogs();
        if (rowIdx < logList.length) cell.setData(logList[logList.length - rowIdx - 1]);
    }
}
