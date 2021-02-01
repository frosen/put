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
    const i = Math.floor(n);
    const s = n - i;
    return i + (randomRate(s) ? 1 : 0);
}

/** c值的正负r范围 */
export function randomArea(c: number, r: number): number {
    return c * (1 - r + Math.random() * 2 * r);
}

export function randomAreaInt(c: number, r: number): number {
    return Math.floor(randomArea(c, r));
}

export function randomAreaByIntRange(c: number, n: number): number {
    return c - n + Math.floor(Math.random() * (2 * n + 1));
}

export function getRandomOneInList<T>(list: Array<T>): T {
    return list[randomInt(list.length)];
}

export function getRandomOneInListByRate<T>(list: Array<T>, rates: number[]): T {
    if (list.length - 1 !== rates.length) cc.error('PUT getRandomOneInListByRate 参数数量有误');
    const r = Math.random();
    for (let index = 0; index < list.length; index++) {
        const rInList = rates[index];
        if (!rInList || r < rInList) return list[index];
    }
    return list[0];
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
