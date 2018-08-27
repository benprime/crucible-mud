import mocks from '../../spec/mocks';
import sut from './inventory';
import Item from '../models/item';
import each from 'jest-each';

describe('inventory', () => {

  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockReset());


  describe('execute', () => {
    beforeEach(() => {
      socket.character.equipSlots.weaponMain = null;
      socket.character.equipSlots.weaponOff = null;
      socket.character.equipSlots.body = null;
      socket.character.equipSlots.back = null;
      socket.character.equipSlots.legs = null;
      socket.character.equipSlots.feet = null;
      socket.character.equipSlots.arms = null;
      socket.character.equipSlots.hands = null;
      socket.character.equipSlots.head = null;
      socket.character.equipSlots.neck = null;
      socket.character.equipSlots.fingerMain = null;
      socket.character.equipSlots.fingerOff = null;
    });

    describe('inventory display of equipped items', () => {
      each([
        [new Item({ displayName: 'testEquippedItem', equip: 'weaponMain' }), 'Main Weapon'],
        [new Item({ displayName: 'testEquippedItem', equip: 'weaponOff' }), 'Offhand Weapon'],
        [new Item({ displayName: 'testEquippedItem', equip: 'head' }), 'Head'],
        [new Item({ displayName: 'testEquippedItem', equip: 'body' }), 'Body'],
        [new Item({ displayName: 'testEquippedItem', equip: 'back' }), 'Back'],
        [new Item({ displayName: 'testEquippedItem', equip: 'legs' }), 'Legs'],
        [new Item({ displayName: 'testEquippedItem', equip: 'feet' }), 'Feet'],
        [new Item({ displayName: 'testEquippedItem', equip: 'arms' }), 'Arms'],
        [new Item({ displayName: 'testEquippedItem', equip: 'hands' }), 'Hands'],
        [new Item({ displayName: 'testEquippedItem', equip: 'neck' }), 'Neck'],
        [new Item({ displayName: 'testEquippedItem', equip: 'fingerMain' }), 'Main Hand Finger'],
        [new Item({ displayName: 'testEquippedItem', equip: 'fingerOff' }), 'Off Hand Finger'],
      ]).test('should print equipped item on %s equip slot', (equippedItem, slotDisplayString) => {
        // arrange
        socket.character.inventory = [equippedItem];
        socket.character.equipSlots[equippedItem.equip] = equippedItem.id;

        // act
        return sut.execute(socket.character).then(response => {
          // assert
          let expectedString = `${slotDisplayString}: </span><span class="silver">${equippedItem.displayName}</span>`;
          expect(response).toContain(expectedString);
        });

      });
    });

    test('should display backpack items', () => {
      // arrange
      socket.character.inventory = [
        { displayName: 'ItemOne' },
        { displayName: 'ItemTwo' },
        { displayName: 'ItemThree' },
      ];
      const expectedString = '<span class="cyan">Backpack: </span><span class="silver">ItemOne, ItemTwo, ItemThree</span>';

      // act
      return sut.execute(socket.character).then(response => {
        // assert
        expect(response).toContain(expectedString);
      });

    });

    test('should display key items', () => {
      // arrange
      socket.character.keys = [
        { displayName: 'KeyOne' },
        { displayName: 'KeyTwo' },
        { displayName: 'KeyThree' },
      ];
      const expectedString = '<span class="cyan">Keys: </span><span class="silver">KeyOne, KeyTwo, KeyThree</span>';

      // act
      return sut.execute(socket.character).then(response => {
        // assert
        expect(response).toContain(expectedString);
      });

    });

    describe('currency display', () => {
      each([
        [0, '0 copper'],
        [1, '1 copper'],

        [9, '9 copper'],
        [10, '1 silver'],
        [11, '1 silver, 1 copper'],

        [99, '9 silver, 9 copper'],
        [100, '1 gold'],
        [101, '1 gold, 1 copper'],

        [999, '9 gold, 9 silver, 9 copper'],
        [1000, '1 platinum'],
        [1001, '1 platinum, 1 copper'],

        [9999, '9 platinum, 9 gold, 9 silver, 9 copper'],
        [10000, '10 platinum'],
        [10001, '10 platinum, 1 copper'],

        [99999, '99 platinum, 9 gold, 9 silver, 9 copper'],
        [100000, '100 platinum'],
        [100001, '100 platinum, 1 copper'],

        [1111, '1 platinum, 1 gold, 1 silver, 1 copper'],
      ]).test('should print correct currency string for amount on %s equip slot', (currency, expectedString) => {
        // arrange
        socket.character.currency = currency;

        // act
        return sut.execute(socket.character).then(response => {
          // assert
          expect(response).toContain(expectedString);
        });

      });
    });

  });
});
