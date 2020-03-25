/*
 * PageActExplCatch.ts
 * 宠物捕捉列表页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import ListView from 'scripts/ListView';
import PageActExplCatchLVD from './PageActExplCatchLVD';
import { BattleController } from 'pages/page_act_expl/scripts/BattleController';

@ccclass
export default class PageActExplCatch extends PageBase {
    battleController: BattleController = null;
    battleId: number = 0;

    setData(data: any) {
        this.battleController = data.ctrlr;
        this.battleId = data.id;
        let lvd = this.getComponent(PageActExplCatchLVD);
        lvd.initListData(this, data.pets);
    }

    onPageShow() {
        this.ctrlr.setTitle('捕捉');
        this.ctrlr.setBackBtnEnabled(true);
        this.getComponentInChildren(ListView).resetContent(true);
    }

    setCatchPetIndex(index: number) {
        this.battleController.setCatchPetIndex(this.battleId, index);
        this.ctrlr.popPage();
    }
}
