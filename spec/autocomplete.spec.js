'use strict';

require('../globals');
const roomManager = require('../roomManager');
const mocks = require('./mocks');
const rewire = require('rewire');

const sut = rewire('../autocomplete');
sut.getTargetList = sut.__get__('getTargetList');
sut.autocompleteByProperty = sut.__get__('autocompleteByProperty');
sut.ambigiousMessage = sut.__get__('ambigiousMessage');

describe('autocomplete', function () {
  let socket;
  let room;
  let roomManagerSpy;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    socket.user = {
      name: 'a user',
      inventory: [],
      keys: [],
    };
    room = mocks.getMockRoom();
    roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => room);
  });

  it('TargetTypes should be expected object', function () {
    expect(Object.keys(sut.TargetTypes).length).toBe(4);
    expect(sut.TargetTypes.Mob).toBe('mob');
    expect(sut.TargetTypes.Inventory).toBe('inventory');
    expect(sut.TargetTypes.Key).toBe('key');
    expect(sut.TargetTypes.Room).toBe('room');
  });

  describe('getTargetList', function () {

    it('should return mob list when target is mob', function () {
      // arrange
      let target = sut.TargetTypes.Mob;

      // act
      var result = sut.getTargetList(socket, target);

      // assert
      expect(result).toBe(room.mobs);
    });

    it('should return room inventory list when target is room', function () {
      // arrange
      let target = sut.TargetTypes.Room;

      // act
      var result = sut.getTargetList(socket, target);

      // assert
      expect(result).toBe(room.inventory);
    });

    it('should return user inventory list when target is inventory', function () {
      // arrange
      let target = sut.TargetTypes.Inventory;

      // act
      var result = sut.getTargetList(socket, target);

      // assert
      expect(result).toBe(socket.user.inventory);
    });

    it('should return user key list when target is key', function () {
      // arrange
      let target = sut.TargetTypes.Key;

      // act
      var result = sut.getTargetList(socket, target);

      // assert
      expect(result).toBe(socket.user.keys);
    });

    it('should throw exception when target is invalid', function () {
      // arrange
      let target = 'invalid target';

      // act and assert
      expect(() => { sut.getTargetList(socket, target); }).toThrowError(Error, 'Invalid target.');
    });

  });

  describe('autocompleteByProperty', function () {

    it('returns object when only one target type has a match', function () {
      // arrange
      const testObj = { name: 'test name', displayName: 'test displayName' };
      socket.user.inventory = [testObj];

      // act
      var result = sut.autocompleteByProperty(socket, ['inventory', 'room'], 'displayName', 'tes');

      // assert
      expect(result.length).toBe(1);
      expect(result[0].target).toBe('inventory');
      expect(result[0].matchedValue).toBe('test displayName');
    });

    it('returns empty array when no object matches', function () {
      // arrange
      socket.user.inventory.push({ displayName: 'bbb' });
      room.inventory.push({ displayName: 'bbb' });

      // act
      var result = sut.autocompleteByProperty(socket, ['inventory', 'room'], 'displayName', 'a');

      // assert
      expect(result.length).toBe(0);
    });

    it('returns array containing all matching objects when more than one target type matches', function () {
      // arrange
      const userInventoryItem = { displayName: 'aaa' };
      const roomInventoryItem = { displayName: 'aaa' };
      socket.user.inventory.push(userInventoryItem);
      room.inventory.push(roomInventoryItem);

      // act
      var result = sut.autocompleteByProperty(socket, ['inventory', 'room'], 'displayName', 'a');

      // assert
      expect(result.length).toBe(2);
      expect(result.find(i => i.matchedValue === userInventoryItem.displayName 
        && i.target === 'inventory')).not.toBeNull();
      expect(result.find(i => i.matchedValue === roomInventoryItem.displayName
        && i.target === 'room')).not.toBeNull();
    });
  });

  describe('autocomplete method', function () {

    it('should return object if only displayName has a matching object', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'bbb' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'ccc', displayName: 'ddd' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocomplete(socket, ['inventory', 'room'], 'c');

      // assert
      expect(result).toBe(roomItem);
    });

    it('should return object if only name has a matching object', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'bbb' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'ccc', displayName: 'ddd' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocomplete(socket, ['inventory', 'room'], 'a');

      // assert
      expect(result).toBe(inventoryItem);
    });

    it('should return null if neither name or displayName have matching object', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'aaa' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'aaa', displayName: 'aaa' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocomplete(socket, ['inventory', 'room'], 'b');

      // assert
      expect(result).toBeNull();
    });

    it('should return null and send ambigious message if number of results is greater than 1', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'aaa' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'aaa', displayName: 'aaa' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocomplete(socket, ['inventory', 'room'], 'a');

      // assert
      expect(result).toBeNull();
      expect(socket.emit).toHaveBeenCalled();
    });
  });

});