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
import { GameDataTool, CnsumDataTool, PetDataTool, EquipDataTool, CaughtPetDataTool } from 'scripts/Memory';
import { PagePkgEquip } from 'pages/page_pkg_equip/scripts/PagePkgEquip';
import { ListViewCell } from 'scripts/ListViewCell';
import { FuncBar } from 'pages/page_pet/prefabs/prefab_func_bar/scripts/FuncBar';
import { PagePet } from 'pages/page_pet/scripts/PagePet';
import { drinkModelDict } from 'configs/DrinkModelDict';
import { PagePkgSelection } from 'pages/page_pkg_selection/scripts/PagePkgSelection';
import { equipModelDict } from 'configs/EquipModelDict';
import { eqpAmplrModelDict } from 'configs/EqpAmplrModelDict';
import { PagePetCellType } from 'pages/page_pet/scripts/PagePetLVD';
import { NavBar } from 'scripts/NavBar';
import { PagePkgTouchLayer } from './PagePkgTouchLayer';

export const LIST_NAMES = ['全部', '装备', '饮品', '捕捉', '强化', '其他'];
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

    @property(PagePkgTouchLayer)
    touchLayer: PagePkgTouchLayer = null;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const selections = this.selectionLayer.children;
        for (let index = 0; index < LIST_NAMES.length; index++) {
            const listNode = cc.instantiate(this.listPrefab);
            listNode.parent = this.listLayer;
            listNode.x = index * WIDTH;

            const list = listNode.getComponent(ListView);
            const delegate = list.delegate as PagePkgLVD;
            delegate.page = this;

            this.listDatas.push({ dirtyToken: 0, list, delegate });

            const selection = selections[index];
            selection.on('click', () => {
                this.turnList(index);
            });

            const lblNode = selection.children[0];
            lblNode.getComponent(cc.Label).string = LIST_NAMES[index];
            this.selectionLblNodes.push(lblNode);
        }

        const funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '使用', callback: this.onUseCell.bind(this) },
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) },
            { str: '丢弃', callback: this.onRemoveCell.bind(this) }
        ]);

        this.touchLayer.init(this);
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setTitle('道具');
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;
        this.navBar.setSubTitle(`${gameData.weight}/${GameDataTool.getItemCountMax(gameData)}`);

        this.turnList(this.curListIdx);
    }

    resetCurList() {
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        const curData = this.listDatas[this.curListIdx];
        if (curData.dirtyToken !== curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            const items = this.ctrlr.memory.gameData.items;
            const idxs = PagePkg.getItemIdxsByListIdx(items, this.curListIdx);
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    static getItemIdxsByListIdx(items: Item[], listIdx: number): number[] {
        const idxs: number[] = [];
        if (listIdx === 0) {
            for (let index = 0; index < items.length; index++) idxs[index] = index;
        } else if (listIdx === 1) {
            this.getoutItemIdxsByType(items, idxs, ItemType.equip);
        } else if (listIdx === 2) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.drink);
        } else if (listIdx === 3) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.catcher);
            this.getoutItemIdxsByType(items, idxs, ItemType.caughtPet);
        } else if (listIdx === 4) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.eqpAmplr);
        }
        return idxs;
    }

    static getoutItemIdxsByType(items: Item[], idxsOut: number[], itemType: ItemType, cnsumType: CnsumType = null) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (item.itemType === itemType && cnsumType && (item as Cnsum).cnsumType === cnsumType) {
                idxsOut[idxsOut.length] = index;
            }
        }
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

    moveList(moveDis: number) {
        const nextIdx = this.curListIdx + moveDis;
        if (nextIdx < 0 || this.listDatas.length <= nextIdx) {
            cc.log('PUT can not move list to ', nextIdx);
            return;
        }

        this.turnList(nextIdx);
    }

    // -----------------------------------------------------------------

    onCellClick(cell: ListViewCell) {}

    onCellClickFuncBtn(cell: ListViewCell) {
        this.funcBar.showFuncBar(cell.curCellIdx, cell.node);
    }

    onCellClickDetailBtn(cell: ListViewCell) {}

    // -----------------------------------------------------------------

    onUseCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const idxList = this.listDatas[this.curListIdx].delegate.curItemIdxs;
        const itemIdx = idxList[cellIdx];
        const item = gameData.items[itemIdx];
        cc.log('PUT 使用道具：', item.id);

        // llytodo
        if (item.itemType === ItemType.cnsum) {
            const cnsum = item as Cnsum;
            if (cnsum.cnsumType === CnsumType.drink) {
                this.ctrlr.pushPage(PagePet, {
                    cellPetType: PagePetCellType.selection,
                    name: '选择宠物',
                    callback: (cellIdx: number, curPet: Pet) => {
                        const drinkModel = drinkModelDict[cnsum.id];
                        this.ctrlr.popAlert(
                            `确定对“${PetDataTool.getCnName(curPet)}”使用“${drinkModel.cnName}”吗？`,
                            (key: number) => {
                                if (key === 1) {
                                    const rzt = GameDataTool.useDrinkToPet(gameData, curPet, cnsum);
                                    if (rzt === GameDataTool.SUC) {
                                        GameDataTool.deleteItem(gameData, itemIdx);
                                        this.ctrlr.popPage();
                                    } else this.ctrlr.popToast(rzt);
                                }
                            }
                        );
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
                        const equipModel = equipModelDict[equip.id];
                        const eAModel = eqpAmplrModelDict[cnsum.id];
                        if (equipModel.lv > eAModel.lvMax) {
                            this.ctrlr.popToast(`该武器等级超过“${eAModel.cnName}”等级上限Lv${eAModel.lvMax}\n无法使用`);
                            return;
                        }
                        const needCount = Math.pow(2, equip.growth);
                        if (needCount > cnsum.count) {
                            const str = `该武器成长到${equip.growth + 1}需要${needCount}颗“${eAModel.cnName}”\n目前数量不足`;
                            this.ctrlr.popToast(str);
                            return;
                        }

                        const str =
                            `确定使用${needCount}颗“${eAModel.cnName}”(共${cnsum.count}颗)\n` +
                            `提升“${EquipDataTool.getCnName(equip)}”的成长等级吗？`;
                        this.ctrlr.popAlert(str, (key: number) => {
                            if (key === 1) {
                                const rzt = GameDataTool.growForEquip(gameData, equip);
                                if (rzt === GameDataTool.SUC) {
                                    GameDataTool.deleteItem(gameData, itemIdx);
                                    this.ctrlr.popToast(`“${EquipDataTool.getCnName(equip)}”的成长等级升至${equip.growth}级`);
                                    this.ctrlr.popPage();
                                } else this.ctrlr.popToast(rzt);
                            }
                        });
                    }
                });
            } else if (cnsum.cnsumType === CnsumType.material) {
                this.ctrlr.popToast('材料无法直接使用');
            }
        } else if (item.itemType === ItemType.equip) {
            this.ctrlr.pushPage(PagePkgEquip, { idx: itemIdx });
        } else if (item.itemType === ItemType.caughtPet) {
            const caughtPet = item as CaughtPet;
            const rzt = GameDataTool.addPet(gameData, caughtPet.petId, caughtPet.lv, caughtPet.rank, caughtPet.features);
            if (rzt === GameDataTool.SUC) {
                GameDataTool.deleteItem(gameData, itemIdx);
                this.resetCurList();
            } else this.ctrlr.popToast(rzt);
        }
    }

    onMoveUpCell(cellIdx: number) {
        const rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, cellIdx, cellIdx - 1);
        if (rzt === GameDataTool.SUC) this.resetCurList();
        else this.ctrlr.popToast(rzt);
    }

    onMoveDownCell(cellIdx: number) {
        const rzt = GameDataTool.moveItemInList(this.ctrlr.memory.gameData, cellIdx, cellIdx + 1);
        if (rzt === GameDataTool.SUC) this.resetCurList();
        else if (rzt) this.ctrlr.popToast(rzt);
    }

    onRemoveCell(cellIdx: number) {
        const gameData = this.ctrlr.memory.gameData;
        const idxList = this.listDatas[this.curListIdx].delegate.curItemIdxs;
        const itemIdx = idxList[cellIdx];
        const item = gameData.items[itemIdx];
        cc.log('PUT 丢弃道具：', item.id);

        let name: string;
        if (item.itemType === ItemType.cnsum) {
            name = CnsumDataTool.getModelById(item.id).cnName;
        } else if (item.itemType === ItemType.equip) {
            name = EquipDataTool.getCnName(item as Equip);
        } else if (item.itemType === ItemType.caughtPet) {
            name = CaughtPetDataTool.getCnName(item as CaughtPet);
        }

        const str = `确定将“${name}”丢弃吗？\n` + '注意：丢弃后将无法找回哦！';

        if (item.itemType === ItemType.cnsum) {
            this.ctrlr.popAlert(
                str,
                (key: number) => {
                    if (key === 0) return;
                    const count = key === 1 ? 1 : (item as Cnsum).count;
                    const rzt = GameDataTool.deleteItem(this.ctrlr.memory.gameData, itemIdx, count);
                    if (rzt === GameDataTool.SUC) this.resetCurList();
                    else this.ctrlr.popToast(rzt);
                },
                '丢弃1件',
                '全部丢弃'
            );
        } else {
            this.ctrlr.popAlert(str, (key: number) => {
                if (key === 1) {
                    const rzt = GameDataTool.deleteItem(this.ctrlr.memory.gameData, itemIdx);
                    if (rzt === GameDataTool.SUC) this.resetCurList();
                    else this.ctrlr.popToast(rzt);
                }
            });
        }
    }
}
