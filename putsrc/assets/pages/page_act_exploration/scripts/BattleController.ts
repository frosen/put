/*
 * BattleController.ts
 * 战斗处理类
 * luleyan
 */

import { Memory, PetState, Pet, ExplorationModel, Pet2 } from 'scripts/Memory';
import PageActExploration from './PageActExploration';

// random with seed -----------------------------------------------------------------

let seed = 5;
function srand(s: number) {
    seed = s;
}

function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
}

function randInt(min: number, max: number) {
    return Math.floor(min + rand() * (max - min));
}

// random -----------------------------------------------------------------

function random(c: number): number {
    return Math.floor(Math.random() * c);
}

function getRandomOneInList(list) {
    return list[random(list.length)];
}

function normalRandom(c) {
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

// -----------------------------------------------------------------

export class BattlePet {
    idx: number = 0;
    /** 用于标识当前位置宠物是否变化 */
    token: string = '';

    liveIdx: number = 0;

    pet: Pet = null;
    pet2: Pet2 = null;

    hp: number = 0;

    init(idx: number, pet: Pet, pet2: Pet2) {
        this.idx = idx;
        this.liveIdx = idx;
        this.pet = pet;
        this.pet2 = pet2;

        this.token = BattlePet.getPetToken(pet);

        this.hp = pet2.hpMax;
    }

    static getPetToken(pet: Pet): string {
        let token = String(pet.catchIdx) + '&';
        for (const equip of pet.equips) {
            token += equip.id + '!';
            for (const extra of equip.extras) {
                token += extra + '$';
            }
        }
        return token;
    }
}

export class RealBattle {
    selfPets: BattlePet[] = [];
    selfPetCount: number = 0;
    mpMax: number = 0;
    mp: number = 0;
    rage: number = 0;

    enemyPets: BattlePet[] = [];
    enemyPetCount: number = 0;
    enemyPetDatas: Pet[] = [];
    enemyPet2Datas: Pet2[] = [];

    battleRound: number = 0;
    order: BattlePet[] = [];
    curIdx: number = 0;
}

export default class BattleController {
    page: PageActExploration = null;
    memory: Memory = null;

    realBattle: RealBattle = null;

    init(page: PageActExploration, memory: Memory) {
        this.page = page;
        this.memory = memory;
        this.realBattle = new RealBattle();
    }

    resetOurTeam() {
        this.realBattle.selfPets.length = 0;

        let pets = this.memory.gameData.pets;
        let pet2s = this.memory.gameData2.pet2s;

        let mpMax = 0;
        for (let petIdx = 0; petIdx < pets.length; petIdx++) {
            const pet = pets[petIdx];
            if (pet.state != PetState.ready) continue;
            let pet2 = pet2s[petIdx];

            let battlePet = new BattlePet();
            battlePet.init(petIdx, pet, pet2);

            this.realBattle.selfPets.push(battlePet);

            mpMax += pet2.mpMax;
        }
        this.realBattle.selfPetCount = pets.length;

        this.realBattle.mpMax = mpMax;
        this.realBattle.mp = mpMax;

        this.page.setUIofSelfPet(-1);
    }

    checkIfOurTeamChanged(): boolean {
        let pets = this.memory.gameData.pets;
        let selfPets = this.realBattle.selfPets;
        for (let petIdx = 0; petIdx < selfPets.length; petIdx++) {
            const battlePet = selfPets[petIdx];
            let pet = pets[battlePet.idx];
            let newToekn = BattlePet.getPetToken(pet);
            if (newToekn != battlePet.token) {
                return true;
            }
        }
        return false;
    }

    start() {
        let seed = new Date().getTime() % 999999;
        srand(seed);

        // 更新memory
        this.memory.createBattle(seed);

        let gameData = this.memory.gameData;
        let posId = gameData.curPosId;
        let curPosModel = this.memory.actPosModelDict[posId];
        let explModel: ExplorationModel = <ExplorationModel>curPosModel.actDict['exploration'];

        let petCount = random(5) + 1;
        let step = gameData.curExploration.curStep;

        let enmeyPetType1 = getRandomOneInList(explModel.petIds);
        let enmeyPetType2 = getRandomOneInList(explModel.petIds);

        for (let index = 0; index < petCount; index++) {
            let id = Math.random() > 0.5 ? enmeyPetType1 : enmeyPetType2;
            let level = Math.max(1, explModel.lv - 2 + normalRandom(5));
            let rank = normalRandom(step * 2) + 1;
            this.memory.createEnemyPet(id, level, rank);
        }

        // 更新battle
        let rb = this.realBattle;
        rb.enemyPetDatas.length = 0;
        rb.enemyPet2Datas.length = 0;
        rb.enemyPets.length = 0;
        let enemys = gameData.curExploration.curBattleField.enemys;
        for (let index = 0; index < enemys.length; index++) {
            const enemyPet = enemys[index];

            let petData = new Pet();
            petData.id = enemyPet.id;
            petData.level = enemyPet.level;
            petData.rank = enemyPet.rank;
            rb.enemyPetDatas.push(petData);

            let pet2Data = new Pet2();
            let petModel = this.memory.petModelDict[enemyPet.id];
            pet2Data.setData(petData, petModel);
            rb.enemyPet2Datas.push(pet2Data);

            let battlePet = new BattlePet();
            battlePet.init(index, petData, pet2Data);

            rb.enemyPets.push(battlePet);
        }
        rb.enemyPetCount = enemys.length;

        rb.battleRound = 0;
        rb.order.length = 0;
        for (const pet of rb.selfPets) rb.order.push(pet);
        for (const pet of rb.enemyPets) rb.order.push(pet);

        // 日志
        let petModelDict = this.memory.petModelDict;
        let petNames = '';
        for (const ePet of this.realBattle.enemyPets) {
            let petId = ePet.pet.id;
            let cnName = petModelDict[petId].cnName;
            petNames += cnName + ' ';
        }
        this.page.log('进入战斗：' + petNames);

        this.gotoNextRound();
    }

    update() {}

    gotoNextRound() {
        let rb = this.realBattle;

        // 处理buff

        // 处理速度列表
        let petModelDict = this.memory.petModelDict;
        rb.order.sort((a: BattlePet, b: BattlePet): number => {
            let sa = a.pet2.exSpeed || petModelDict[a.pet.id].speed;
            let sb = b.pet2.exSpeed || petModelDict[b.pet.id].speed;
            return sb - sa;
        });

        rb.curIdx = 0;
        rb.battleRound++;

        this.page.log(`第${rb.battleRound}回合`);
    }
}
