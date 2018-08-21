import mocks from '../../spec/mocks';
import sut from './inventory';

describe('inventory', () => {

  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockReset());

  describe('execute', () => {

    const equipSlotTest = (testName, equipSlot, equippedItem, expectedString) => {
      describe('should display equipped items', () => {
        beforeEach(() => {
          socket.character.equipSlots.weaponMain = null;
          socket.character.equipSlots.weaponOff = null;
          socket.character.equipSlots.body = null;
          socket.character.equipSlots.back = null;
          socket.character.equipSlots.legs = null;
          socket.character.equipSlots.feet = null;
          socket.character.equipSlots.arms = null;
          socket.character.equipSlots.hands = null;
          socket.character.equipSlots.neck = null;
          socket.character.equipSlots.fingerMain = null;
          socket.character.equipSlots.fingerOff = null;
        });

        test(testName, () => {

          // arrange
          socket.character.inventory = [];
          socket.character.equipSlots[equipSlot] = equippedItem;

          // act
          return sut.execute(socket.character).then(response => {

            // assert
            expect(response).toContain(expectedString);
          });

        });
      });
    };

    equipSlotTest('should print equipped item on weaponMain', 'weaponMain', { displayName: 'testEquippedItem' }, 'Main Weapon: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on weaponOff', 'weaponOff', { displayName: 'testEquippedItem' }, 'Offhand Weapon: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on head', 'head', { displayName: 'testEquippedItem' }, 'Head: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on body', 'body', { displayName: 'testEquippedItem' }, 'Body: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on back', 'back', { displayName: 'testEquippedItem' }, 'Back: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on legs', 'legs', { displayName: 'testEquippedItem' }, 'Legs: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on feet', 'feet', { displayName: 'testEquippedItem' }, 'Feet: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on arms', 'arms', { displayName: 'testEquippedItem' }, 'Arms: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on hands', 'hands', { displayName: 'testEquippedItem' }, 'Hands: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on neck', 'neck', { displayName: 'testEquippedItem' }, 'Neck: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on main finger', 'fingerMain', { displayName: 'testEquippedItem' }, 'Main Hand Finger: </span><span class="silver">testEquippedItem</span>');
    equipSlotTest('should print equipped item on off hand finger', 'fingerOff', { displayName: 'testEquippedItem' }, 'Off Hand Finger: </span><span class="silver">testEquippedItem</span>');
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

  const currencyTest = (testName, currency, expectedString) => {
    describe('should display currency', () => {

      test(testName, () => {
        // arrange
        socket.character.currency = currency;

        // act
        return sut.execute(socket.character).then(response => {
          // assert
          expect(response).toContain(expectedString);
        });

      });
    });
  };
  currencyTest('when user is carrying no money', 0, '0 copper');
  currencyTest('', 1, '1 copper');

  currencyTest('', 9, '9 copper');
  currencyTest('', 10, '1 silver');
  currencyTest('', 11, '1 silver, 1 copper');

  currencyTest('', 99, '9 silver, 9 copper');
  currencyTest('', 100, '1 gold');
  currencyTest('', 101, '1 gold, 1 copper');

  currencyTest('', 999, '9 gold, 9 silver, 9 copper');
  currencyTest('', 1000, '1 platinum');
  currencyTest('', 1001, '1 platinum, 1 copper');

  currencyTest('', 9999, '9 platinum, 9 gold, 9 silver, 9 copper');
  currencyTest('', 10000, '10 platinum');
  currencyTest('', 10001, '10 platinum, 1 copper');

  currencyTest('', 99999, '99 platinum, 9 gold, 9 silver, 9 copper');
  currencyTest('', 100000, '100 platinum');
  currencyTest('', 100001, '100 platinum, 1 copper');

  currencyTest('', 1111, '1 platinum, 1 gold, 1 silver, 1 copper');
});
