/*
 * DebugTool.ts
 * 调试相关
 * luleyan
 */

export default class DebugTool {
    ctrling: boolean = false;

    /** 用于快捷键的key */
    shortCutKey: string = '';

    /** 自定义的快捷键 */
    shortCutDict: { [key: string]: (() => void)[] } = {};

    init() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyboardPress, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyboardInput, this);
        this.setShortCut('sd', this.showDebugInfo.bind(this));
    }

    onKeyboardPress(event: cc.Event.EventKeyboard) {
        if (CC_BUILD) return;
        if (event.keyCode == cc.macro.KEY.ctrl) {
            this.ctrling = true;
            this.shortCutKey = '';
        }
    }

    onKeyboardInput(event: cc.Event.EventKeyboard) {
        if (CC_BUILD) return;

        if (event.keyCode == cc.macro.KEY.ctrl) {
            this.ctrling = false;
        }

        this.doShortCut(event.keyCode);
    }

    getValeByShortCut(key: number): string {
        if (key == cc.macro.KEY.a) return 'a';
        if (key == cc.macro.KEY.b) return 'b';
        if (key == cc.macro.KEY.c) return 'c';
        if (key == cc.macro.KEY.d) return 'd';
        if (key == cc.macro.KEY.e) return 'e';
        if (key == cc.macro.KEY.f) return 'f';
        if (key == cc.macro.KEY.g) return 'g';
        if (key == cc.macro.KEY.h) return 'h';
        if (key == cc.macro.KEY.i) return 'i';
        if (key == cc.macro.KEY.j) return 'j';
        if (key == cc.macro.KEY.k) return 'k';
        if (key == cc.macro.KEY.l) return 'l';
        if (key == cc.macro.KEY.m) return 'm';
        if (key == cc.macro.KEY.n) return 'n';
        if (key == cc.macro.KEY.o) return 'o';
        if (key == cc.macro.KEY.p) return 'p';
        if (key == cc.macro.KEY.q) return 'q';
        if (key == cc.macro.KEY.r) return 'r';
        if (key == cc.macro.KEY.s) return 's';
        if (key == cc.macro.KEY.t) return 't';
        if (key == cc.macro.KEY.u) return 'u';
        if (key == cc.macro.KEY.v) return 'v';
        if (key == cc.macro.KEY.w) return 'w';
        if (key == cc.macro.KEY.x) return 'x';
        if (key == cc.macro.KEY.y) return 'y';
        if (key == cc.macro.KEY.z) return 'z';
        if (key == cc.macro.KEY['9'] || key == cc.macro.KEY.num9) return '9';
        if (key == cc.macro.KEY['8'] || key == cc.macro.KEY.num8) return '8';
        if (key == cc.macro.KEY['7'] || key == cc.macro.KEY.num7) return '7';
        if (key == cc.macro.KEY['6'] || key == cc.macro.KEY.num6) return '6';
        if (key == cc.macro.KEY['5'] || key == cc.macro.KEY.num5) return '5';
        if (key == cc.macro.KEY['4'] || key == cc.macro.KEY.num4) return '4';
        if (key == cc.macro.KEY['3'] || key == cc.macro.KEY.num3) return '3';
        if (key == cc.macro.KEY['2'] || key == cc.macro.KEY.num2) return '2';
        if (key == cc.macro.KEY['1'] || key == cc.macro.KEY.num1) return '1';
        if (key == cc.macro.KEY['0'] || key == cc.macro.KEY.num0) return '0';
        return null;
    }

    doShortCut(key: number) {
        if (this.ctrling == false) {
            return;
        }
        let v = this.getValeByShortCut(key);
        if (!v) {
            return;
        }

        this.shortCutKey += v;

        for (const key in this.shortCutDict) {
            if (!this.shortCutDict.hasOwnProperty(key)) continue;
            if (this.shortCutKey == key) {
                const callbacks = this.shortCutDict[key];
                if (callbacks) for (const callback of callbacks) callback();
                this.shortCutKey = '';
                break;
            }
        }
    }

    setShortCut(key: string, callback: () => void) {
        if (!this.shortCutDict.hasOwnProperty(key)) {
            this.shortCutDict[key] = [];
        }
        this.shortCutDict[key].push(callback);
    }

    // -----------------------------------------------------------------

    showDebugInfo() {
        let debugNode = cc.director.getScene().getChildByName('PROFILER-NODE');
        if (debugNode) {
            let newColor = cc.color(
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255),
                Math.floor(Math.random() * 255)
            );
            for (const child of debugNode.children) child.color = newColor;
        }
        cc.debug.setDisplayStats(!cc.debug.isDisplayStats());
    }
}
