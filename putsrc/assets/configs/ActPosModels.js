let models = [
    {
        id: 'YiZhuang',
        cnName: '易庄',
        acts: ['work', 'quest', 'shop', 'equipMarket', 'petMarket', 'recycler', 'store', 'awardsCenter'],
        actDict: {
            work: null,
            quest: null,
            shop: null,
            equipMarket: null,
            petMarket: null,
            recycler: null,
            store: null,
            awardsCenter: null
        },
        evts: [],
        movs: [{ id: 'GuangJiDianDaDao', price: 0, condition: {} }],
        loc: { x: 1000, y: 100 }
    },
    {
        id: 'GuangJiDianDaDao',
        cnName: '光机电大道',
        acts: ['exploration'],
        actDict: {
            exploration: null
        },
        evts: [],
        movs: [{ id: 'YiZhuang', price: 0, condition: {} }],
        loc: { x: 1100, y: 100 }
    }
];

module.exports = models;

if (CC_EDITOR) {
    let keys = ['id', 'cnName', 'acts', 'actDict', 'evts', 'movs', 'loc'];

    function testKeys(model, index, keys) {
        let curKeys = Object.keys(model);
        let count = 0;
        for (const curKey of curKeys) {
            if (keys.includes(curKey)) {
                count++;
            } else {
                cc.error('ActPosModels中包含错误的key：', index, curKey, keys);
            }
        }
        if (count != keys.length) {
            cc.error('ActPosModels中key的数量与需要的不符：', index, count, keys);
        }
    }

    function testActs(model, index) {
        let acts = ['work', 'quest', 'shop', 'equipMarket', 'petMarket', 'recycler', 'store', 'awardsCenter', 'exploration'];
        let curActs = model.acts;
        for (const curAct of curActs) {
            if (!acts.includes(curAct)) cc.error('ActPosModels中包含错误的act：', index, curAct);
        }
        let curActDict = model.actDict;
        testKeys(curActDict, index, curActs);
    }

    (function test(models) {
        for (let index = 0; index < models.length; index++) {
            const model = models[index];
            testKeys(model, index, keys);
            testActs(model, index);
        }
    })(models);
}
