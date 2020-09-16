/*
 * CellUpdateDisplay.ts
 * 显示更新时间
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewCell } from 'scripts/ListViewCell';
import { EqpMktUpdataInterval } from 'pages/page_act_eqpmkt/scripts/PageActEqpMkt';

@ccclass
export class CellUpdateDisplay extends ListViewCell {
    @property(cc.Label)
    lbl: cc.Label = null;

    setData(updateTime: number) {
        const nextUpdTime = updateTime + EqpMktUpdataInterval;
        const nowDate = new Date();
        const now = nowDate.getTime();
        const diff = nextUpdTime - now;
        const nextUpdDate = new Date(nextUpdTime);
        const str = `更新时间：${this.getDay(nowDate, nextUpdDate)}${this.getHourMin(nextUpdDate)}[剩余${this.getDiffStr(diff)}]`;
        this.lbl.string = str;
    }

    getDay(nowDate: Date, updateDate: Date): string {
        const nowDay = nowDate.getDate();
        const updateDay = updateDate.getDate();
        const diff = updateDay - nowDay;
        if (diff === 0) return '今天';
        if (diff === 1) return '明天';
        if (diff > 1) return `${diff}天后`;
        return '?';
    }

    getHourMin(updateDate: Date): string {
        return `${updateDate.getHours()}时${updateDate.getMinutes()}分`;
    }

    getDiffStr(diff: number): string {
        const diffH = Math.floor(diff / (1000 * 60 * 60));
        if (diffH > 0) return String(diffH) + 'H';

        const diffM = Math.floor(diff / (1000 * 60));
        if (diffM > 0) return String(diffM) + 'm';

        return '<1m';
    }
}
