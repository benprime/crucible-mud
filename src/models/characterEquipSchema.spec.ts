import Character from './character';
import Item from './item';
import each from 'jest-each';

let character = new Character();

let shortSword = new Item({
  name: 'short sword',
  equipSlots: ['weaponMain'],
});

let shield = new Item({
  name: 'shield',
  equipSlots: ['weaponOff'],
});

let greatSword = new Item({
  name: 'excalibur clone',
  equipSlots: ['weaponMain', 'weaponOff'],
});

let helmet = new Item({
  name: 'helmet',
  equipSlots: ['head'],
});

let chainmail = new Item({
  name: 'chainmail',
  equipSlots: ['body'],
});

let cloak = new Item({
  name: 'cloak',
  equipSlots: ['back'],
});

let leggings = new Item({
  name: 'leggings',
  equipSlots: ['legs'],
});

let boots = new Item({
  name: 'boots',
  equipSlots: ['feet'],
});

let bracers = new Item({
  name: 'bracers',
  equipSlots: ['arms'],
});

let gloves = new Item({
  name: 'gloves',
  equipSlots: ['hands'],
});

let amulet = new Item({
  name: 'amulet',
  equipSlots: ['neck'],
});

let goldRing = new Item({
  name: 'gold ring',
  equipSlots: ['fingerMain'],
});

let silverRing = new Item({
  name: 'silver ring',
  equipSlots: ['fingerOff'],
});

character.inventory = [
  shortSword, shield, greatSword, helmet, chainmail, cloak,
  bracers, gloves, leggings, boots, amulet, goldRing, silverRing];

describe('character.equipped', () => {

  beforeEach(() => {
    character.equipped.unequipAll();
  });

  describe('getDesc', () => {

    describe('weapons', () => {

      test('when only weaponMain slot is equipped', () => {
        // arrange
        character.equipped.weaponMain = shortSword.id;

        // act
        const result = character.equipped.getDesc();

        // assert
        expect(result).toBe('He is holding a short sword.');
      });

      test('when only weaponOff slot is equipped', () => {
        // arrange
        character.equipped.weaponOff = shield.id;

        // act
        const result = character.equipped.getDesc();

        // assert
        expect(result).toBe('He is holding a shield.');
      });

      test('when both weaponMain and weaponOff slots are equipped with different items', () => {
        // arrange
        character.equipped.weaponMain = shortSword.id;
        character.equipped.weaponOff = shield.id;

        // act
        const result = character.equipped.getDesc();

        // assert
        expect(result).toBe('He is holding a short sword and a shield.');
      });

      test('when a two handed weapon is equipped', () => {
        // arrange
        character.equipped.weaponMain = greatSword.id;
        character.equipped.weaponOff = greatSword.id;

        // act
        const result = character.equipped.getDesc();

        // assert
        expect(result).toBe('He is holding an excalibur clone.');
      });

      test('when no weapon is equipped', () => {
        // act
        const result = character.equipped.getDesc();

        // assert
        expect(result).toBe('He is unarmed.');
      });

      describe('armor and clothing equipped', () => {
        each([
          [helmet, 'On his head he wears a helmet.'],
          [chainmail, 'He is wearing chainmail.'],
          [bracers, 'He is wearing bracers.'],
          [gloves, 'He is wearing gloves.'],
          [leggings, 'He is wearing leggings.'],
          [boots, 'He is wearing boots.'],
          [cloak, 'A cloak falls behind him.'],
          [amulet, 'He is adorned with an amulet.'],
          [goldRing, 'He is adorned with a gold ring.'],
          [silverRing, 'He is adorned with a silver ring.'],
        ]).test('outputs equipped item when slot is equipped', (equippedItem, expected) => {
          // arrange
          character.equipped[equippedItem.equipSlots[0]] = equippedItem.id;

          // act
          const result = character.equipped.getDesc();

          // assert
          expect(result).toMatch(expected);
        });
      });

      describe('armor and clothing unequipped', () => {
        each([
          [helmet, 'On his head he wears a helmet.'],
          [chainmail, 'He is wearing chainmail.'],
          [bracers, 'He is wearing bracers.'],
          [gloves, 'He is wearing gloves.'],
          [leggings, 'He is wearing leggings.'],
          [boots, 'He is wearing boots.'],
          [cloak, 'A cloak falls behind him.'],
          [amulet, 'He is adorned with an amulet.'],
          [goldRing, 'He is adorned with a gold ring.'],
          [silverRing, 'He is adorned with a silver ring.'],
        ]).test('outputs no string for unequipped items', (equippedItem, expected) => {
          // arrange

          // act
          const result = character.equipped.getDesc();

          // assert
          expect(result).not.toMatch(expected);
        });
      });

      test('all equipment slots equipped', () => {
        // arrange
        character.equipped.weaponMain = shortSword.id;
        character.equipped.weaponOff = shield.id;
        character.equipped.head = helmet.id;
        character.equipped.body = chainmail.id;
        character.equipped.back = cloak.id;
        character.equipped.legs = leggings.id;
        character.equipped.feet = boots.id;
        character.equipped.arms = bracers.id;
        character.equipped.hands = gloves.id;
        character.equipped.neck = amulet.id;
        character.equipped.fingerMain = goldRing.id;
        character.equipped.fingerOff = silverRing.id;

        // act
        const result = character.equipped.getDesc();

        // assert
        expect(result).toMatch('He is holding a short sword and a shield. On his head he wears a helmet. He is wearing chainmail, bracers, gloves, leggings, and boots. A cloak falls behind him. He is adorned with an amulet, a gold ring, and a silver ring.');
      });

    });
  });
});

