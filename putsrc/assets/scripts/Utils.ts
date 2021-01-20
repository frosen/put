/*
 * Utils.ts
 * 各种工具
 * luleyan
 */

/** 深拷贝 */
export function deepCopy<T>(o: T): T {
    //先判断Array
    if (o instanceof Array) {
        const n: any[] = [];
        for (let i = 0; i < o.length; ++i) n[i] = deepCopy(o[i]);
        return (n as unknown) as T;
    } else if (o instanceof Object) {
        if ('clone' in o) {
            // @ts-ignore
            return o.clone();
        } else {
            // @ts-ignore
            const n: T = {};
            for (const i in o) n[i] = deepCopy(o[i]);
            return n;
        }
    } else {
        return o;
    }
}

// math -----------------------------------------------------------------

export function getDigit(num: number): number {
    if (num > 0) return 1 + Math.floor(Math.log10(num));
    else if (num === 0) return 0;
    else return 1 + Math.floor(Math.log10(-num));
}

export function getNumInDigit(num: number, digit: number): number {
    const max = getDigit(num);
    if (digit <= 0 || max < digit) return 0;
    return Math.floor((num / Math.pow(10, digit - 1)) % 10);
}

// array -----------------------------------------------------------------

// @ts-ignore
Array.prototype.removeIndex = function (ridx) {
    this[ridx] = undefined;
    for (let index = this.length - 1; index >= 0; index--) {
        if (typeof this[index] === 'undefined') continue;
        this.length = index + 1;
        return;
    }
    this.length = 0;
};

// @ts-ignore
Array.prototype.getLast = function () {
    return this.length > 0 ? this[this.length - 1] : null;
};

// @ts-ignore
Array.prototype.getOne = function (callback) {
    for (let index = 0; index < this.length; index++) {
        const curItem = this[index];
        if (callback(curItem)) return curItem;
    }
    return null;
};

// @ts-ignore
Array.prototype.getAvg = function (call: (a: any) => number) {
    let total: number = 0;
    for (const one of this) total += call(one);
    total /= this.length;
    return total;
};

// @ts-ignore
Array.prototype.getMax = function (call: (a: any) => number) {
    let max: number = -99999999;
    for (const one of this) max = Math.max(max, call(one));
    return max;
};

// @ts-ignore
Array.prototype.equals = function <T>(anotherList: T[], call: (a: T, b: T) => boolean): boolean {
    if (this.length === anotherList.length) {
        for (let index = 0; index < this.length; index++) {
            const thisOne = this[index];
            const another = anotherList[index];
            if (!call(thisOne, another)) return false;
        }
        return true;
    } else return false;
};
