/*
 * Memory.ts
 * 储存
 * luleyan
 */

const MagicNum = Math.floor(Math.random() * 10000);

function newWithChecker<T extends Object>(cls: { new (): T }): T {
    let ins = new cls();
    let checkIns = new cls();
    return new Proxy(ins, {
        set: function(target, key, value, receiver) {
            checkIns[key] = MagicNum - value;
            return Reflect.set(target, key, value, receiver);
        },
        get: function(target, key) {
            let v = target[key];
            if (typeof v == 'number') {
                if (MagicNum - v != checkIns[key] && v != checkIns[key]) {
                    throw new Error('number check wrong!');
                }
            }
            return v;
        }
    });
}

export class Pet {
    type: number = 0;
}

export class Item {
    type: number = 0;
}

export class GameData {
    pets: Pet[] = [];
    items: Item[] = [];
    item: Item = newWithChecker(Item);

    id: number = 0;
}

export class Memory {
    gameData: GameData = newWithChecker(GameData);

    init() {}
}
