/*
 * PagePkgEquip.ts
 * 装备列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PkgEquipItemLVD from './PkgEquipItemLVD';
import PkgEquipPetLVD from './PkgEquipPetLVD';
import PagePkg from 'pages/page_pkg/scripts/PagePkg';

@ccclass
export class PagePkgEquip extends PageBase {
    @property(ListView)
    itemEquipList: ListView = null;

    @property(ListView)
    petEquipList: ListView = null;

    onPageShow() {
        this.ctrlr.setTitle('装配');
        this.ctrlr.setBackBtnEnabled(true);

        // set data
        let items = this.ctrlr.memory.gameData.items;
        let idxs = PagePkg.getItemIdxsByListIdx(items, 1);
        (this.itemEquipList.delegate as PkgEquipItemLVD).initListData(items, idxs);

        let pets = this.ctrlr.memory.gameData.pets;
        (this.petEquipList.delegate as PkgEquipPetLVD).initListData(pets);

        // reset list
        this.itemEquipList.resetContent(true);
        this.petEquipList.resetContent(true);
    }
}
