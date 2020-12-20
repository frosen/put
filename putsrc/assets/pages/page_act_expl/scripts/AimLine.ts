/*
 * AimLine.ts
 * 战斗目标指向所用
 * luleyan
 */

const { ccclass, property } = cc._decorator;

export enum LineType {
    toSelf = 1,
    toEnemy,
    normal
}

@ccclass
export class AimLine extends cc.Component {
    lineType: LineType;

    setPos(fromX: number, fromY: number, toX: number, toY: number) {
        this.node.setPosition(fromX, fromY);

        const dX = toX - fromX;
        const dY = toY - fromY;
        const w = Math.sqrt(dX * dX + dY * dY);
        const r = Math.atan(dY / dX) / 0.017453293 + (toX > fromX ? 0 : 180);
        this.node.width = w;
        this.node.angle = r;
    }

    setLineType(lt: LineType) {
        this.lineType = lt;
        if (lt === LineType.toSelf) this.node.color = cc.Color.GREEN;
        else if (lt === LineType.toEnemy) this.node.color = cc.Color.RED;
    }

    show() {
        this.node.opacity = 255;
    }

    hide() {
        this.node.opacity = 0;
    }

    isShowing(): boolean {
        return this.node.opacity > 0;
    }
}
