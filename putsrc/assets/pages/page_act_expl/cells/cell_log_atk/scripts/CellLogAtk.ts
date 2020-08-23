/*
 * CellLogAtk.ts
 * 探索日志
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { CellLogBase } from 'pages/page_act_expl/scripts/CellLogBase';
import { ExplLogData } from 'scripts/ExplUpdater';
import { PageActExplLVD } from 'pages/page_act_expl/scripts/PageActExplLVD';
import { LogNumSprite } from 'pages/page_act_expl/scripts/LogNumSprite';
import { EleTypeNames } from 'scripts/DataSaved';

@ccclass
export class CellLogAtk extends CellLogBase {
    @property(cc.Sprite)
    petNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    duiSp: cc.Sprite = null;
    @property(cc.Sprite)
    aimNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    useSp: cc.Sprite = null;
    @property(cc.Sprite)
    sklNameSp: cc.Sprite = null;
    @property(cc.Sprite)
    comboSp: cc.Sprite = null;
    @property(cc.Sprite)
    handleSp: cc.Sprite = null;
    @property(LogNumSprite)
    dmgSp: LogNumSprite = null;
    @property(cc.Sprite)
    pointSp: cc.Sprite = null;
    @property(cc.Sprite)
    eleTypeSp: cc.Sprite = null;

    @property(cc.Node)
    baseNode: cc.Node = null;

    init(lvd: PageActExplLVD) {
        super.init(lvd);

        this.lvd.setSpByString(this.duiSp, '对');
        this.lvd.setSpByString(this.useSp, '使用');
        this.lvd.setSpByString(this.pointSp, '点');
        this.dmgSp.init(this.lvd);
    }

    setData(data: ExplLogData) {
        // let logStr = `${petModelDict[battlePet.pet.id].cnName}对${petModelDict[aim.pet.id].cnName}使用${skillName}`;
        // if (dmg > 0) {
        //     if (beCombo) logStr += '连击';
        //     logStr += `，造成${Math.floor(dmg * 0.1)}点${eleType ? EleTypeNames[eleType] : '物理'}伤害`;
        // } else {
        //     logStr += `，恢复血量${Math.floor(dmg * -0.1)}点`;
        // }

        let petName = data.data[0];
        let aimName = data.data[1];
        let sklName = data.data[2];
        let combo = data.data[3];
        let dmg = data.data[4];
        let eleType = data.data[5];

        this.lvd.setSpByString(this.petNameSp, petName);
        this.lvd.setSpByString(this.aimNameSp, aimName);
        this.lvd.setSpByString(this.sklNameSp, sklName);
        if (dmg > 0) {
            this.lvd.setSpByString(this.comboSp, combo ? '连击' : null);
            this.lvd.setSpByString(this.handleSp, '，造成');
            this.dmgSp.setNum(dmg);
            this.lvd.setSpByString(this.eleTypeSp, (eleType ? EleTypeNames[eleType] : '物理') + '伤害');
        } else {
            this.lvd.setSpByString(this.comboSp, null);
            this.lvd.setSpByString(this.handleSp, '，恢复血量');
            this.dmgSp.setNum(-dmg);
            this.lvd.setSpByString(this.eleTypeSp, null);
        }

        let curX = 0;
        for (let index = 0; index < this.baseNode.children.length; index++) {
            const node = this.baseNode.children[index];
            node.x = curX;
            curX += node.width;
        }
        this.baseNode.width = curX;
    }
}