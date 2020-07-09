/*
 * PagePkg.ts
 * 道具列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PagePkgBase } from './PagePkgBase';
import { ListView } from 'scripts/ListView';
import { PagePkgLVD } from './PagePkgLVD';
import { Item, ItemType, Cnsum, CnsumType, Pet, CaughtPet, Equip } from 'scripts/DataSaved';
import { GameDataTool } from 'scripts/Memory';
import { PagePkgEquip } from 'pages/page_pkg_equip/scripts/PagePkgEquip';
import { ListViewCell } from 'scripts/ListViewCell';
import { FuncBar } from 'pages/page_pet/prefabs/prefab_func_bar/scripts/FuncBar';
import { PagePet } from 'pages/page_pet/scripts/PagePet';
import { petModelDict } from 'configs/PetModelDict';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { PagePkgSelection } from 'pages/page_pkg_selection/scripts/PagePkgSelection';
import { equipModelDict } from 'configs/EquipModelDict';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';
import { catcherModelDict } from 'configs/CatcherModelDict';
import { PagePetCellType } from 'pages/page_pet/scripts/PagePetLVD';

const LIST_NAMES = ['全部', '装备', '饮品', '捕捉', '强化', '其他'];
const WIDTH = 1080;

@ccclass
export class PagePkg extends PagePkgBase {
    curListIdx: number = 0;

    @property(cc.Node)
    listLayer: cc.Node = null;

    @property(cc.Prefab)
    listPrefab: cc.Prefab = null;

    listDatas: { dirtyToken: number; list: ListView; delegate: PagePkgLVD }[] = [];

    @property(cc.Node)
    selectionLayer: cc.Node = null;

    @property(cc.Node)
    selectionBar: cc.Node = null;

    selectionLblNodes: cc.Node[] = [];

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null;

    funcBar: FuncBar = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        let selections = this.selectionLayer.children;
        for (let index = 0; index < LIST_NAMES.length; index++) {
            let listNode = cc.instantiate(this.listPrefab);
            listNode.parent = this.listLayer;
            listNode.x = index * WIDTH;

            let list = listNode.getComponent(ListView);
            let delegate = list.delegate as PagePkgLVD;
            delegate.page = this;

            this.listDatas.push({ dirtyToken: 0, list, delegate });

            let selection = selections[index];
            selection.on('click', () => {
                this.turnList(index);
            });

            let lblNode = selection.children[0];
            lblNode.getComponent(cc.Label).string = LIST_NAMES[index];
            this.selectionLblNodes.push(lblNode);
        }

        let funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '使用', callback: this.onUseCell.bind(this) },
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) },
            { str: '丢弃', callback: this.onRemoveCell.bind(this) }
        ]);
    }

    onPageShow() {
        this.ctrlr.setTitle('道具');
        let gameData = this.ctrlr.memory.gameData;
        this.ctrlr.setSubTitle(`${gameData.weight}/${GameDataTool.getItemCountMax(gameData)}`);

        this.turnList(this.curListIdx);
    }

    resetCurList() {
        let curDirtyToken = this.ctrlr.memory.dirtyToken;
        let curData = this.listDatas[this.curListIdx];
        if (curData.dirtyToken !== curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            let items = this.ctrlr.memory.gameData.items;
            let idxs = PagePkg.getItemIdxsByListIdx(items, this.curListIdx);
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    static getItemIdxsByListIdx(items: Item[], listIdx: number): number[] {
        let idxs: number[] = [];
        if (listIdx === 0) {
            for (let index = 0; index < items.length; index++) idxs[index] = index;
        } else if (listIdx === 1) {
            for (let index = 0; index < items.length; index++) {
                if (items[index].itemType === ItemType.equip) idxs[idxs.length] = index;
            }
        } else if (listIdx === 2) {
            for (let index = 0; index < items.length; index++) {
                let item = items[index];
                if (item.itemType === ItemType.cnsum && (item as Cnsum).cnsumType === CnsumType.drink) idxs[idxs.length] = index;
            }
        } else if (listIdx === 3) {
            for (let index = 0; index < items.length; index++) {
                let item = items[index];
                if (
                    (item.itemType === ItemType.cnsum && (item as Cnsum).cnsumType === CnsumType.catcher) ||
                    item.itemType === ItemType.caughtPet
                ) {
                    idxs[idxs.length] = index;
                }
            }
        } else if (listIdx === 4) {
            for (let index = 0; index < items.length; index++) {
                let item = items[index];
                if (item.itemType === ItemType.cnsum && (item as Cnsum).cnsumType === CnsumType.eqpAmplr)
                    idxs[idxs.length] = index;
            }
        }
        return idxs;
    }

    turnning: boolean = false;

    turnList(idx: number) {
        if (this.turnning) return;

        if (this.curListIdx !== idx) {
            this.curListIdx = idx;
            this.resetCurList();

            this.turnning = true;
            cc.tween(this.listLayer)
                .to(0.2, { x: idx * WIDTH * -1 }, { easing: 'quadInOut' })
                .call(() => {
                    this.turnning = false;
                })
                .start();

            for (const lblNode of this.selectionLblNodes) lblNode.color = cc.color(90, 90, 90);
            this.selectionLblNodes[idx].color = cc.Color.RED;

            cc.tween(this.selectionBar)
                .to(0.2, { x: idx * 180 + 90 }, { easing: 'quadInOut' })
                .start();
        } else {
            this.resetCurList();
        }
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {}

    onCellClickFuncBtn(cell: ListViewCell) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    onCellClickDetailBtn(cell: ListViewCell) {}

    // -----------------------------------------------------------------

    onUseCell(cellIdx: number) {
        let gameData = this.ctrlr.memory.gameData;
        let idxList = this.listDatas[this.curListIdx].delegate.curItemIdxs;
        let itemIdx = idxList[cellIdx];
        let item = gameData.items[itemIdx];
        cc.log('PUT 使用道具：', item.id);

        // llytodo
        if (item.itemType === ItemType.cnsum) {
            let cnsum = item as Cnsum;
            if (cnsum.cnsumType === CnsumType.drink) {
                this.ctrlr.pushPage(PagePet, {
                    cellPetType: PagePetCellType.selection,
                    name: '选择宠物',
                    callback: (cellIdx: number, curPet: Pet) => {
                        let petModel = petModelDict[curPet.id];
                        let drinkModel = drinkModelDict[cnsum.id];
                        this.ctrlr.popAlert(`确定对“${petModel.cnName}”使用“${drinkModel.cnName}”吗？`, (key: number) => {
                            if (key === 1) {
                                let rzt = GameDataTool.useDrinkToPet(gameData, curPet, cnsum);
                                if (rzt === GameDataTool.SUC) {
                                    GameDataTool.deleteItem(gameData, itemIdx);
                                    this.ctrlr.popPage();
                                } else this.ctrlr.popToast(rzt);
                            }
                        });
                    }
                });
            } else if (cnsum.cnsumType === CnsumType.catcher) {
                this.ctrlr.popToast('捕捉器会在战斗中开启“捕捉”后自动使用');
            } else if (cnsum.cnsumType === CnsumType.eqpAmplr) {
                this.ctrlr.pushPage(PagePkgSelection, {
                    name: '选择要强化的装备',
                    curItemIdxs: PagePkg.getItemIdxsByListIdx(gameData.items, 1),
                    callback: (cellIdx: number, equipIdx: number, equip: Equip) => {
                        if (equip.growth >= 5) {
                            this.ctrlr.popToast('该武器成长等级已达到上限');
                            return;
                        }
                        let equipModel = equipModelDict[equip.id];
                        let eaModel = eqpAmplrModelDict[cnsum.id];
                        if (equipModel.lv > eaModel.lvMax) {
                            this.ctrlr.popToast(`该武器等级超过“${eaModel.cnName}”等级上限Lv${eaModel.lvMax}\n无法使用`);
                            return;
                        }
                        let needCount = Math.pow(2, equip.growth);
                        if (needCount > cnsum.count) {
                            let str = `该武器成长到${equip.growth + 1}需要${needCount}颗“${eaModel.cnName}”\n目前数量不足`;
                            this.ctrlr.popToast(str);
                            return;
                        }

                        let str =
                            `确定使用${needCount}颗“${eaModel.cnName}”(共${cnsum.count}颗)\n` +
                            `提升“${equipModel.cnName}”的成长等级吗？`;
                        this.ctrlr.popAlert(str, (key: number) => {
                            if (key === 1) {
                                let rzt = GameDataTool.growForEquip(gameData, equip);
                                if (rzt === GameDataTool.SUC) {
                                    GameDataTool.deleteItem(gameData, itemIdx);
                                    this.ctrlr.popToast(`“${equipModel.cnName}”的成长等级升至${equip.growth}级`);
                                    this.ctrlr.popPage();
                                } else this.ctrlr.popToast(rzt);
                            }
                        });
                    }
                });
            }
        } else if (item.itemType === ItemType.equip) {
            this.ctrlr.pushPage(PagePkgEquip, { idx: itemIdx });
        } else if (item.itemType === ItemType.caughtPet) {
            let caughtPet = item as CaughtPet;
            let rzt = GameDataTool.addPet(gameData, caughtPet.petId, caughtPet.lv, caughtPet.rank, caughtPet.features);
            if (rzt === GameDataTool.SUC) {
                GameDataTool.deleteItem(gameData, itemIdx);
                this.resetCurList();
            } else this.ctrlr.popToast(rzt);
        }
    }

    onMoveUpCell(cellIdx: number) {
        let rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, cellIdx, cellIdx - 1);
        if (rzt === GameDataTool.SUC) this.resetCurList();
        else this.ctrlr.popToast(rzt);
    }

    onMoveDownCell(cellIdx: number) {
        let rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, cellIdx, cellIdx + 1);
        if (rzt === GameDataTool.SUC) this.resetCurList();
        else if (rzt) this.ctrlr.popToast(rzt);
    }

    onRemoveCell(cellIdx: number) {
        let gameData = this.ctrlr.memory.gameData;
        let idxList = this.listDatas[this.curListIdx].delegate.curItemIdxs;
        let itemIdx = idxList[cellIdx];
        let item = gameData.items[itemIdx];
        cc.log('PUT 丢弃道具：', item.id);

        let name: string;
        if (item.itemType === ItemType.cnsum) {
            if ((item as Cnsum).cnsumType === CnsumType.drink) {
                name = drinkModelDict[item.id].cnName;
            } else if ((item as Cnsum).cnsumType === CnsumType.catcher) {
                name = catcherModelDict[item.id].cnName;
            } else if ((item as Cnsum).cnsumType === CnsumType.eqpAmplr) {
                name = eqpAmplrModelDict[item.id].cnName;
            }
        } else if (item.itemType === ItemType.equip) {
            name = equipModelDict[item.id].cnName;
        } else if (item.itemType === ItemType.caughtPet) {
            name = '捕获中的' + petModelDict[(item as CaughtPet).petId].cnName;
        }

        let str = `确定将“${name}”丢弃吗？\n` + '注意：丢弃后将无法找回哦！';

        if (item.itemType === ItemType.cnsum) {
            this.ctrlr.popAlert(
                str,
                (key: number) => {
                    if (key === 0) return;
                    let count = key === 1 ? 1 : (item as Cnsum).count;
                    let rzt = GameDataTool.deleteItem(this.ctrlr.memory.gameData, itemIdx, count);
                    if (rzt === GameDataTool.SUC) this.resetCurList();
                    else this.ctrlr.popToast(rzt);
                },
                '丢弃1件',
                '全部丢弃'
            );
        } else {
            this.ctrlr.popAlert(str, (key: number) => {
                if (key === 1) {
                    let rzt = GameDataTool.deleteItem(this.ctrlr.memory.gameData, itemIdx);
                    if (rzt === GameDataTool.SUC) this.resetCurList();
                    else this.ctrlr.popToast(rzt);
                }
            });
        }
    }
}
