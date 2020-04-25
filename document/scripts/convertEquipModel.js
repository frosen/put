/**
 * 转换pet model
 */

let convert = require('./xlsToJs');

convert('../put.xls', '../../putsrc/assets/configs/EquipModelDict.ts', 'equip', 'equipModelDict', 'EquipModel', function (data) {
    equipJson = {};
    for (let rowIdx = 1; rowIdx < data.length; rowIdx++) {
        const rowData = data[rowIdx];

        console.log('>>> ', rowData[0]);

        let name1 = rowData[0];
        let name2 = rowData[1];
        let name3 = rowData[2];

        let equipPosType = Number(rowData[3].substr(0, 1));
        let bioType = Number(rowData[4].substr(0, 1));
        let attriType = Number(rowData[5].substr(0, 1));
        let eleType = Number(rowData[6].substr(0, 1));
        let lv = Number(rowData[7]);

        let strength = Number(rowData[8]);
        let concentration = Number(rowData[9]);
        let durability = Number(rowData[10]);
        let agility = Number(rowData[11]);
        let sensitivity = Number(rowData[12]);
        let elegant = Number(rowData[13]);

        let armor = Number(rowData[14]);

        let f1 = rowData[15];
        let f2 = rowData[16];

        let id1 = rowData[17];
        let id2 = rowData[18];
        let id3 = rowData[19];

        let baseData = {
            lv,
            equipPosType,
            bioType,
            attriType,
            eleType,

            strength,
            concentration,
            durability,
            agility,
            sensitivity,
            elegant,
            armor
        };

        let changeAttris = function (json, attriName, rank) {
            let attri = json[attriName];
            if (!attri) json[attriName] = 0;
            else {
                json[attriName] += Math.floor(attri / 100) * 10 * rank;
            }
        };

        let addBaseData = function (json, rank) {
            let newJson = Object.assign(json, { rank }, baseData);

            let realRank = rank - 1;
            changeAttris(newJson, 'strength', realRank);
            changeAttris(newJson, 'concentration', realRank);
            changeAttris(newJson, 'durability', realRank);
            changeAttris(newJson, 'agility', realRank);
            changeAttris(newJson, 'sensitivity', realRank);
            changeAttris(newJson, 'elegant', realRank);
            changeAttris(newJson, 'armor', realRank);

            equipJson[newJson.id] = newJson;
        };

        if (name1) {
            addBaseData(
                {
                    id: id1,
                    cnName: name1,
                    featureIds: []
                },
                1
            );
        }

        if (name2) {
            addBaseData(
                {
                    id: id2,
                    cnName: name2,
                    featureIds: [f1]
                },
                2
            );
        }

        if (name3) {
            addBaseData(
                {
                    id: id3,
                    cnName: name3,
                    featureIds: [f1, f2]
                },
                3
            );
        }
    }

    return equipJson;
});
