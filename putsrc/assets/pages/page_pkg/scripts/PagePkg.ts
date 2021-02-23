/*
 * PagePkg.ts
 * 道具列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { PagePkgBase } from './PagePkgBase';
import { ListView } from '../../../scripts/ListView';
import { PagePkgLVD } from './PagePkgLVD';
import { Item, ItemType, Cnsum, CnsumType, Pet, CaughtPet, Equip, PetState } from '../../../scripts/DataSaved';
import { GameDataTool, CnsumTool, PetTool, EquipTool, CaughtPetTool } from '../../../scripts/Memory';
import { PagePkgEquip } from '../../page_pkg_equip/scripts/PagePkgEquip';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { FuncBar } from '../../page_pet/scripts/FuncBar';
import { PagePet } from '../../page_pet/scripts/PagePet';
import { DrinkModelDict } from '../../../configs/DrinkModelDict';
import { PagePkgSelection } from '../../page_pkg_selection/scripts/PagePkgSelection';
import { EquipModelDict } from '../../../configs/EquipModelDict';
import { EqpAmplrModelDict } from '../../../configs/EqpAmplrModelDict';
import { PagePetCellType } from '../../page_pet/scripts/PagePetLVD';
import { NavBar } from '../../../scripts/NavBar';
import { PkgSelectionBar } from './PkgSelectionBar';
import { CatcherModelDict } from '../../../configs/CatcherModelDict';
import { PetModelDict } from '../../../configs/PetModelDict';
import { SpcModelDict, SpcN } from '../../../configs/SpcModelDict';

const WIDTH = 1080;

@ccclass
export class PagePkg extends PagePkgBase {
    curListIdx: number = 0;

    @property(cc.Node)
    listLayer: cc.Node = null!;

    @property(cc.Prefab)
    listPrefab: cc.Prefab = null!;

    listDatas: { dirtyToken: number; list: ListView; delegate: PagePkgLVD }[] = [];

    @property(cc.Node)
    selectionNode: cc.Node = null!;

    @property(cc.Prefab)
    selectionBarPrefab: cc.Node = null!;

    selectionBar: PkgSelectionBar = null!;

    @property(cc.Prefab)
    funcBarPrefab: cc.Prefab = null!;

    funcBar: FuncBar = null!;

    @property(cc.Node)
    leftBtnNode: cc.Node = null!;

    @property(cc.Node)
    rightBtnNode: cc.Node = null!;

    onLoad() {
        super.onLoad();
        if (CC_EDITOR) return;

        const selectionBarNode = cc.instantiate(this.selectionBarPrefab);
        selectionBarNode.parent = this.selectionNode;

        this.selectionBar = selectionBarNode.getComponent(PkgSelectionBar);
        this.selectionBar.onSelection = (curSelection: number) => {
            this.turnList(curSelection);
        };

        const funcBarNode = cc.instantiate(this.funcBarPrefab);
        funcBarNode.parent = this.node.getChildByName('root');

        this.funcBar = funcBarNode.getComponent(FuncBar);
        this.funcBar.setBtns([
            { str: '使用', callback: this.onUseCell.bind(this) },
            { str: '上移', callback: this.onMoveUpCell.bind(this) },
            { str: '下移', callback: this.onMoveDownCell.bind(this) },
            { str: '丢弃', callback: this.onRemoveCell.bind(this) }
        ]);

        this.leftBtnNode.on(cc.Node.EventType.TOUCH_END, this.onClickLeft.bind(this));
        this.rightBtnNode.on(cc.Node.EventType.TOUCH_END, this.onClickRight.bind(this));
    }

    onLoadNavBar(navBar: NavBar) {
        navBar.setTitle('道具');
    }

    onPageShow() {
        const gameData = this.ctrlr.memory.gameData;
        this.navBar.setSubTitle(`${gameData.weight}/${GameDataTool.getItemCountMax(gameData)}`);

        this.selectionBar.onClickBtn(this.curListIdx);
    }

    resetCurList() {
        const curDirtyToken = this.ctrlr.memory.dirtyToken;
        let curData = this.listDatas[this.curListIdx];
        if (!curData) curData = this.createList(this.curListIdx);
        if (curData.dirtyToken !== curDirtyToken) {
            curData.dirtyToken = curDirtyToken;
            const items = this.ctrlr.memory.gameData.items;
            const idxs = PagePkg.getItemIdxsByListIdx(items, this.curListIdx);
            curData.delegate.initListData(items, idxs);
            curData.list.resetContent(true);
        }
    }

    createList(listIdx: number): { dirtyToken: number; list: ListView; delegate: PagePkgLVD } {
        const listNode = cc.instantiate(this.listPrefab);
        listNode.parent = this.listLayer;
        listNode.x = listIdx * WIDTH;

        const list = listNode.getComponent(ListView);
        const delegate = list.delegate as PagePkgLVD;
        delegate.page = this;

        const listData = { dirtyToken: 0, list, delegate };
        this.listDatas[listIdx] = listData;

        return listData;
    }

    static getItemIdxsByListIdx(items: Item[], listIdx: number): number[] {
        const idxs: number[] = [];
        if (listIdx === -1) {
            for (let index = 1; index < items.length; index++) idxs[index - 1] = index;
        } else if (listIdx === 0) {
            for (let index = 0; index < items.length; index++) idxs[index] = index;
        } else if (listIdx === 1) {
            this.getoutItemIdxsByType(items, idxs, ItemType.equip);
        } else if (listIdx === 2) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.drink);
        } else if (listIdx === 3) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.catcher);
        } else if (listIdx === 4) {
            this.getoutItemIdxsByType(items, idxs, ItemType.caughtPet);
        } else if (listIdx === 5) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.eqpAmplr);
        } else if (listIdx === 6) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.book);
        } else if (listIdx === 7) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.special);
        } else if (listIdx === 8) {
            this.getoutItemIdxsByType(items, idxs, ItemType.cnsum, CnsumType.material);
        }
        return idxs;
    }

    static getoutItemIdxsByType(items: Item[], idxsOut: number[], itemType: ItemType, cnsumType?: CnsumType) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            if (item.itemType === itemType && (cnsumType ? (item as Cnsum).cnsumType === cnsumType : true)) {
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
            this.selectionBar.canTurn = false;
            cc.tween(this.listLayer)
                .to(0.2, { x: idx * WIDTH * -1 }, { easing: cc.easing.quadInOut })
                .call(() => {
                    this.turnning = false;
                    this.selectionBar.canTurn = true;
                })
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
        const gameData = this.ctrlr.memory.gameData;
        const idxList = this.listDatas[this.curListIdx].delegate.curItemIdxs;
        const itemIdx = idxList[cellIdx];
        const item = gameData.items[itemIdx];
        cc.log('PUT 使用道具：', item.id);

        if (item.itemType === ItemType.cnsum) {
            const cnsum = item as Cnsum;
            if (cnsum.cnsumType === CnsumType.drink) {
                this.ctrlr.pushPage(PagePet, {
                    cellPetType: PagePetCellType.selection,
                    name: '选择精灵',
                    callback: (cellIdx: number, curPet: Pet) => {
                        if (!this.checkPetWithMaster(curPet)) return;
                        const drinkModel = DrinkModelDict[cnsum.id];
                        this.ctrlr.popAlert(
                            `确定对“${PetTool.getCnName(curPet)}”使用“${drinkModel.cnName}”吗？`,
                            (key: number) => {
                                if (key === 1) {
                                    const petIdx = GameDataTool.getPetIdx(gameData, curPet);
                                    if (petIdx === -1) return this.ctrlr.popToast('精灵有误');
                                    const drinkIdx = GameDataTool.getItemIdx(gameData, cnsum);
                                    if (drinkIdx === -1) return this.ctrlr.popToast('物品有误');
                                    const rzt = GameDataTool.useDrinkToPet(gameData, petIdx, drinkIdx);
                                    if (rzt === GameDataTool.SUC) {
                                        this.ctrlr.popPage();
                                        const petName = PetTool.getCnName(curPet);
                                        const drinkModel = DrinkModelDict[cnsum.id];
                                        this.ctrlr.popToast(`“${petName}”获得“${drinkModel.cnName}”效果`);
                                    } else this.ctrlr.popToast(rzt);
                                }
                            }
                        );
                    }
                });
            } else if (cnsum.cnsumType === CnsumType.catcher) {
                this.ctrlr.pushPage(PagePet, {
                    cellPetType: PagePetCellType.selection,
                    name: '选择精灵',
                    callback: (cellIdx: number, curPet: Pet) => {
                        const catcherModel = CatcherModelDict[cnsum.id];
                        const petModel = PetModelDict[curPet.id];
                        if (curPet.lv < catcherModel.lvMin || catcherModel.lvMax < curPet.lv) {
                            return this.ctrlr.popToast('等级不符，无法使用');
                        }
                        if (catcherModel.bioType && catcherModel.bioType !== petModel.bioType) {
                            return this.ctrlr.popToast('生物类型不符，无法使用');
                        }
                        if (catcherModel.eleType && catcherModel.eleType !== petModel.eleType) {
                            return this.ctrlr.popToast('元素类型不符，无法使用');
                        }
                        if (catcherModel.btlType && catcherModel.btlType !== petModel.btlType) {
                            return this.ctrlr.popToast('战斗类型不符，无法使用');
                        }
                        if (!this.checkPetWithMaster(curPet)) return;

                        this.ctrlr.popAlert(
                            `确定对“${PetTool.getCnName(curPet)}”使用“${catcherModel.cnName}”吗？`,
                            (key: number) => {
                                if (key === 1) {
                                    const petIdx = GameDataTool.getPetIdx(gameData, curPet);
                                    if (petIdx === -1) return this.ctrlr.popToast('精灵有误');
                                    const catcherIdx = GameDataTool.getItemIdx(gameData, cnsum);
                                    if (catcherIdx === -1) return this.ctrlr.popToast('物品有误');
                                    const cPet = CaughtPetTool.createByPet(curPet);
                                    const rzt = GameDataTool.removePet(gameData, petIdx);
                                    if (rzt === GameDataTool.SUC) {
                                        GameDataTool.addCaughtPet(gameData, cPet);
                                        GameDataTool.removeItem(gameData, catcherIdx);
                                        this.ctrlr.popPage();
                                        this.ctrlr.popToast('成功使用“' + catcherModel.cnName + '”');
                                    } else this.ctrlr.popToast(rzt);
                                }
                            }
                        );
                    }
                });
            } else if (cnsum.cnsumType === CnsumType.eqpAmplr) {
                let eqpIdxs: number[] = [];
                PagePkg.getoutItemIdxsByType(gameData.items, eqpIdxs, ItemType.equip);
                this.ctrlr.pushPage(PagePkgSelection, {
                    name: '选择要强化的装备',
                    curItemIdxs: eqpIdxs,
                    callback: (cellIdx: number, equipIdx: number, equip: Equip) => {
                        if (equip.growth >= 5) {
                            this.ctrlr.popToast('该武器成长等级已达到上限');
                            return;
                        }
                        const equipModel = EquipModelDict[equip.id];
                        const eAModel = EqpAmplrModelDict[cnsum.id];
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
                            `提升“${EquipTool.getCnName(equip)}”的成长等级吗？`;
                        this.ctrlr.popAlert(str, (key: number) => {
                            if (key === 1) {
                                const eqpIdx = GameDataTool.getItemIdx(gameData, equip);
                                if (eqpIdx === -1) return this.ctrlr.popToast('装备有误');
                                const eqpAmplrIdx = GameDataTool.getItemIdx(gameData, cnsum);
                                if (eqpAmplrIdx === -1) return this.ctrlr.popToast('物品有误');
                                const rzt = GameDataTool.makeEquipGrow(gameData, eqpIdx);
                                if (rzt === GameDataTool.SUC) {
                                    GameDataTool.removeItem(gameData, eqpAmplrIdx);
                                    this.ctrlr.popPage();

                                    this.ctrlr.popToast(`“${EquipTool.getCnName(equip)}”的成长等级升至${equip.growth}级`);
                                } else this.ctrlr.popToast(rzt);
                            }
                        });
                    }
                });
            } else if (cnsum.cnsumType === CnsumType.book) {
            } else if (cnsum.cnsumType === CnsumType.special) {
                const spcModel = SpcModelDict[cnsum.id];
                if (cnsum.id === SpcN.YiWangShuiJing) {
                    this.ctrlr.pushPage(PagePet, {
                        cellPetType: PagePetCellType.selection,
                        name: '选择精灵',
                        callback: (cellIdx: number, curPet: Pet) => {
                            const petModel = PetModelDict[curPet.id];
                            if (!curPet.nickname) this.ctrlr.popToast('“' + petModel.cnName + '”并未起名');
                            if (!this.checkPetWithMaster(curPet)) return;
                            this.ctrlr.popAlert(
                                `确定对“${PetTool.getCnName(curPet)}”使用“${spcModel.cnName}”吗？`,
                                (key: number) => {
                                    if (key === 1) {
                                        const petIdx = GameDataTool.getPetIdx(gameData, curPet);
                                        if (petIdx === -1) return this.ctrlr.popToast('精灵有误');
                                        const specialIdx = GameDataTool.getItemIdx(gameData, cnsum);
                                        if (specialIdx === -1) return this.ctrlr.popToast('物品有误');
                                        curPet.nickname = '';
                                        GameDataTool.removeItem(gameData, specialIdx);
                                        this.ctrlr.popPage();
                                        this.ctrlr.popToast('“' + petModel.cnName + '”已经遗忘了名字');
                                    }
                                }
                            );
                        }
                    });
                } else if (cnsum.id === SpcN.HouHuiYaoJi) {
                    this.ctrlr.popToast('仅用于撤回事件中的错误决定\n，将进度返回上次选择之前！\n在事件页面点击右上按钮触发');
                }
            } else if (cnsum.cnsumType === CnsumType.material) {
                this.ctrlr.popToast('材料用于合成，无法直接使用');
            }
        } else if (item.itemType === ItemType.equip) {
            this.ctrlr.pushPage(PagePkgEquip, { idx: itemIdx });
        } else if (item.itemType === ItemType.caughtPet) {
            const cPet = item as CaughtPet;
            this.ctrlr.popAlert(`确定使用“${CaughtPetTool.getCnName(cPet)}”吗？`, (key: number) => {
                if (key === 1) {
                    const cPetIdx = GameDataTool.getItemIdx(gameData, cPet);
                    if (cPetIdx === -1) return this.ctrlr.popToast('物品有误');
                    const rzt = GameDataTool.addPetByCaughtPet(gameData, cPet);
                    if (rzt === GameDataTool.SUC) {
                        GameDataTool.removeItem(gameData, cPetIdx);
                        this.resetCurList();
                    } else this.ctrlr.popToast(rzt);
                }
            });
        }
    }

    checkPetWithMaster(pet: Pet): boolean {
        const gameData = this.ctrlr.memory.gameData;
        const withRzt = GameDataTool.checkPetWithMaster(gameData, pet);
        if (withRzt !== GameDataTool.SUC) {
            this.ctrlr.popToast('无法对该精灵使用！\n' + withRzt);
            return false;
        }
        return true;
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
            name = CnsumTool.getModelById(item.id)!.cnName;
        } else if (item.itemType === ItemType.equip) {
            name = EquipTool.getCnName(item as Equip);
        } else if (item.itemType === ItemType.caughtPet) {
            name = CaughtPetTool.getCnName(item as CaughtPet);
        } else name = '?';

        const str = `确定丢弃“${name}”吗？\n` + '注意：丢弃后将无法找回哦！';

        if (item.itemType === ItemType.cnsum) {
            this.ctrlr.popAlert(
                str,
                (key: number) => {
                    if (key === 0) return;
                    const count = key === 1 ? 1 : (item as Cnsum).count;
                    const rzt = GameDataTool.removeItem(this.ctrlr.memory.gameData, itemIdx, count);
                    if (rzt === GameDataTool.SUC) this.resetCurList();
                    else this.ctrlr.popToast(rzt);
                },
                '丢弃1件',
                '全部丢弃'
            );
        } else {
            this.ctrlr.popAlert(str, (key: number) => {
                if (key === 1) {
                    const rzt = GameDataTool.removeItem(this.ctrlr.memory.gameData, itemIdx);
                    if (rzt === GameDataTool.SUC) this.resetCurList();
                    else this.ctrlr.popToast(rzt);
                }
            });
        }
    }

    onClickLeft() {
        this.moveList(-1);
    }

    onClickRight() {
        this.moveList(1);
    }

    moveList(moveDis: number) {
        let nextIdx = this.curListIdx + moveDis;
        if (nextIdx < 0 || this.listDatas.length <= nextIdx) {
            cc.log('PUT can not move list to ', nextIdx);
            // return;
        }

        this.turnList(nextIdx);
    }
}
