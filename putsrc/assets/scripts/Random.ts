/*
 * Random.ts
 * 持续效果
 * luleyan
 */

// random with seed -----------------------------------------------------------------

let seed = 5;
export function setSeed(s: number) {
    seed = s;
}

export function ranWithSeed() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
}

export function ranWithSeedInt(c: number) {
    return Math.floor(ranWithSeed() * c);
}

// random -----------------------------------------------------------------

export function random(c: number): number {
    return Math.floor(Math.random() * c);
}

export function getRandomOneInList(list) {
    return list[random(list.length)];
}

export function normalRandom(c) {
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

export function randomRate(r: number) {
    return Math.random() < r;
}

// -----------------------------------------------------------------
