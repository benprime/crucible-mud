'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./inventory', {});

describe('inventory', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.calls.reset());

  describe('execute', function () {

    const equipSlotTest = function (testName, equipSlot, equippedItem, expectedString) {
      describe('should display equipped items', function () {
        beforeEach(function () {
          socket.user.equipSlots.weaponMain = null;
          socket.user.equipSlots.weaponOff = null;
          socket.user.equipSlots.body = null;
          socket.user.equipSlots.back = null;
          socket.user.equipSlots.legs = null;
          socket.user.equipSlots.feet = null;
          socket.user.equipSlots.arms = null;
          socket.user.equipSlots.hands = null;
          socket.user.equipSlots.neck = null;
          socket.user.equipSlots.fingerMain = null;
          socket.user.equipSlots.fingerOff = null;
        });

        it(testName, function () {

          // arrange
          socket.inventory = [];
          socket.user.equipSlots[equipSlot] = equippedItem;

          // act
          sut.execute(socket);

          // assert
          expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
          expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
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


  it('should display backpack items', function () {
    // arrange
    socket.user.inventory = [
      { displayName: 'ItemOne' },
      { displayName: 'ItemTwo' },
      { displayName: 'ItemThree' },
    ];
    const expectedString = '<span class="cyan">Backpack: </span><span class="silver">ItemOne, ItemTwo, ItemThree</span>';

    // act
    sut.execute(socket);

    // assert
    expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
    expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
  });

  it('should display key items', function () {
    // arrange
    socket.user.keys = [
      { displayName: 'KeyOne' },
      { displayName: 'KeyTwo' },
      { displayName: 'KeyThree' },
    ];
    const expectedString = '<span class="cyan">Keys: </span><span class="silver">KeyOne, KeyTwo, KeyThree</span>';

    // act
    sut.execute(socket);

    // assert
    expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
    expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
  });

  const currencyTest = function (testName, currency, expectedString) {
    describe('should display currency', function () {

      it(testName, function () {
        // arrange
        socket.user.currency = currency;

        // act
        sut.execute(socket);

        // assert
        expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
        expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
      });
    });
  };
  currencyTest('when user is carrying no money', 0, '0 Copper');
  currencyTest('', 1, '1 Copper');

  currencyTest('', 9, '9 Copper');
  currencyTest('', 10, '1 Silver');
  currencyTest('', 11, '1 Silver 1 Copper');

  currencyTest('', 99, '9 Silver 9 Copper');
  currencyTest('', 100, '1 Gold');
  currencyTest('', 101, '1 Gold 1 Copper');

  currencyTest('', 999, '9 Gold 9 Silver 9 Copper');
  currencyTest('', 1000, '1 Platinum');
  currencyTest('', 1001, '1 Platinum 1 Copper');

  currencyTest('', 9999, '9 Platinum 9 Gold 9 Silver 9 Copper');
  currencyTest('', 10000, '10 Platinum');
  currencyTest('', 10001, '10 Platinum 1 Copper');

  currencyTest('', 99999, '99 Platinum 9 Gold 9 Silver 9 Copper');
  currencyTest('', 100000, '100 Platinum');
  currencyTest('', 100001, '100 Platinum 1 Copper');

  currencyTest('', 1111, '1 Platinum 1 Gold 1 Silver 1 Copper');
});
