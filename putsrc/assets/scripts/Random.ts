/*
 * Random.ts
 * 持续效果
 * luleyan
 */

export function random(c: number): number {
    return Math.random() * c;
}

export function randomInt(c: number): number {
    return Math.floor(random(c));
}

export function randomRate(r: number): boolean {
    return Math.random() < r;
}

export function randomRound(n: number): number {
    let i = Math.floor(n);
    let s = n - i;
    return i + (randomRate(s) ? 1 : 0);
}

/** c值的正负r范围 */
export function randomArea(c: number, r: number) {
    return c * (1 + Math.random() * 2 * r - r);
}

export function randomAreaInt(c: number, r: number) {
    return Math.floor(randomArea(c, r));
}

export function getRandomOneInList<T>(list: Array<T>): T {
    if (list instanceof Array) return list[randomInt(list.length)];
    else return null;
}

export function getRandomOneInListWithRate<T>(list: Array<T>, rates: number[]): T {
    if (list instanceof Array) {
        let r = Math.random();
        for (let index = 0; index < list.length; index++) {
            let rInList = rates[index];
            if (!rInList || r < rInList) return list[index];
        }
        return null;
    } else return null;
}

export function normalRandom(c: number): number {
    let r = Math.random();
    if (r <= 0.5) {
        r = 0.5 - r;
        r = 0.5 - r * r * 2;
    } else {
        r = r - 0.5;
        r = 1 - r * r * 2;
    }
    return Math.floor(r * c);
}
