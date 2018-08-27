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
      socket.character.equipped.weaponMain = null;
      socket.character.equipped.weaponOff = null;
      socket.character.equipped.body = null;
      socket.character.equipped.back = null;
      socket.character.equipped.legs = null;
      socket.character.equipped.feet = null;
      socket.character.equipped.arms = null;
      socket.character.equipped.hands = null;
      socket.character.equipped.head = null;
      socket.character.equipped.neck = null;
      socket.character.equipped.fingerMain = null;
      socket.character.equipped.fingerOff = null;
    });

    describe('inventory display of equipped items', () => {
      each([
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['weaponMain'] }), 'Main Weapon'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['weaponOff'] }), 'Offhand Weapon'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['head'] }), 'Head'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['body'] }), 'Body'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['back'] }), 'Back'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['legs'] }), 'Legs'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['feet'] }), 'Feet'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['arms'] }), 'Arms'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['hands'] }), 'Hands'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['neck'] }), 'Neck'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['fingerMain'] }), 'Main Hand Finger'],
        [new Item({ displayName: 'testEquippedItem', equipSlots: ['fingerOff'] }), 'Off Hand Finger'],
      ]).test('should print equipped item on %s equip slot', (equippedItem, slotDisplayString) => {
        // arrange
        socket.character.inventory = [equippedItem];
        for (let slot of equippedItem.equipSlots) {
          socket.character.equipped[slot] = equippedItem.id;
        }


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
