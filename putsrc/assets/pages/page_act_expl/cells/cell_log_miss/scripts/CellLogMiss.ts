/*
 * CellLogMiss.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellLogBase } from 'pages/page_act_expl/scripts/CellLogBase';
import { ExplLogData } from 'scripts/ExplUpdater';
import { PageActExplLVD } from 'pages/page_act_expl/scripts/PageActExplLVD';

@ccclass
export class CellLogMiss extends CellLogBase {
    @property(cc.Sprite)
    petNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    evadeSp: cc.Sprite = null;
    @property(cc.Sprite)
    atkerNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    deSp: cc.Sprite = null;
    @property(cc.Sprite)
    sklNameSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.evadeSp, '避开了');
        this.lvd.setSpByString(this.deSp, '的');
    }

    setData(data: ExplLogData) {
        // const logStr = `${petModelDict[aim.pet.id].cnName}避开了${petModelDict[battlePet.pet.id].cnName}的${skillName}`;
        // this.logCallback(logStr);

        const petName = data.data[0];
        const atkerName = data.data[1];
        const sklName = data.data[2];
        this.lvd.setSpByString(this.petNameSp, petName);
        this.lvd.setSpByString(this.atkerNameSp, atkerName);
        this.lvd.setSpByString(this.sklNameSp, sklName);

        let curX = 0;
        for (let index = 0; index < this.baseNode.children.length; index++) {
            const node = this.baseNode.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.baseNode.width = curX;
    }
}
