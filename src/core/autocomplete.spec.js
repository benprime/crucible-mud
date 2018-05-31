'use strict';

const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const rewire = require('rewire');

const sut = rewire('./autocomplete');
sut.autocompleteByProperty = sut.__get__('autocompleteByProperty');

describe('autocomplete', function () {
  let socket;
  let room;

  describe('autocompleteByProperty', function () {

    beforeEach(function () {
      socket = new mocks.SocketMock();
      socket.user = {
        name: 'a user',
        inventory: [],
        keys: [],
      };
      room = mocks.getMockRoom();
      spyOn(Room, 'getById').and.callFake(() => room);
    });

    it('returns object when only one target type has a match', function () {
      // arrange
      const testObj = { name: 'test name', displayName: 'test displayName' };
      socket.user.inventory = [testObj];

      // act
      var result = sut.autocompleteByProperty(socket.user.inventory, 'displayName', 'tes');

      // assert
      expect(result.length).toBe(1);
      expect(result[0].displayName).toBe('test displayName');
    });

    it('returns empty array when no object matches', function () {
      // arrange
      socket.user.inventory.push({ displayName: 'bbb' });
      room.inventory.push({ displayName: 'bbb' });

      // act
      var result = sut.autocompleteByProperty(socket.user.inventory, 'displayName', 'a');

      // assert
      expect(result.length).toBe(0);
    });

    it('returns array containing all matching objects when more than one target type matches', function () {
      // arrange
      const userInventoryItem = { displayName: 'aaa' };
      socket.user.inventory.push(userInventoryItem);

      // act
      var result = sut.autocompleteByProperty(socket.user.inventory, 'displayName', 'a');

      // assert
      expect(result.length).toBe(1);
      expect(result.find(i => i.matchedValue === userInventoryItem.displayName
        && i.target === 'inventory')).not.toBeNull();
    });
  });

  describe('autocomplete method', function () {

    beforeEach(function () {
      socket = new mocks.SocketMock();
      socket.user = {
        name: 'a user',
        inventory: [],
        keys: [],
      };
      room = mocks.getMockRoom();
      spyOn(Room, 'getById').and.callFake(() => room);
    });

    it('should return object if only displayName has a matching object', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'bbb' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'ccc', displayName: 'ddd' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocompleteTypes(socket, ['inventory', 'room'], 'd');

      // assert
      expect(result.type).toBe('room');
      expect(result.item.name).toBe(roomItem.name);
      expect(result.item.displayName).toBe(roomItem.displayName);
    });

    it('should return object if only name has a matching object', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'bbb' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'ccc', displayName: 'ddd' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocompleteTypes(socket, ['inventory', 'room'], 'a');

      // assert
      expect(result.item).toBe(inventoryItem);
    });

    it('should return null if neither name or displayName have matching object', function () {
      // arrange
      var inventoryItem = { name: 'aaa', displayName: 'aaa' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'aaa', displayName: 'aaa' };
      room.inventory = [roomItem];

      // act
      var result = sut.autocompleteTypes(socket, ['inventory', 'room'], 'b');

      // assert
      expect(result).toBeNull();
    });

  });

});
