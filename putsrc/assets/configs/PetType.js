module.exports = [
    {
        id: 'yizhuang',
        cnName: '易庄',
        acts: ['work', 'quest', 'shop', 'equipMarket', 'petMarket', 'recycler', 'store', 'awardsCenter'],
        evts: [],
        movs: [{ id: 'guangjidiandadao', price: 0, contidion: {} }],
        loc: { x: 1000, y: 100 }
    },
    {
        id: 'guangjidiandadao',
        cnName: '光机电大道',
        acts: ['exploration'],
        evts: [],
        movs: [{ id: 'yizhuang', price: 0, contidion: {} }],
        loc: { x: 1100, y: 100 }
    }
];
