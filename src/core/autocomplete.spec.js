const Room = require('../models/room');
const mocks = require('../../spec/mocks');
const rewire = require('rewire');

const sut = rewire('./autocomplete');
sut.autocompleteByProperty = sut.__get__('autocompleteByProperty');

describe('autocomplete', () => {
  let socket;
  let room;

  describe('autocompleteByProperty', () => {

    beforeEach(() => {
      socket = new mocks.SocketMock();
      socket.user = {
        name: 'a user',
        inventory: [],
        keys: [],
      };
      room = mocks.getMockRoom();
      spyOn(Room, 'getById').and.callFake(() => room);
    });

    it('returns object when only one target type has a match', () => {
      // arrange
      const testObj = { name: 'test name', displayName: 'test displayName' };
      socket.user.inventory = [testObj];

      // act
      const result = sut.autocompleteByProperty(socket.user.inventory, 'displayName', 'tes');

      // assert
      expect(result.length).toBe(1);
      expect(result[0].displayName).toBe('test displayName');
    });

    it('returns empty array when no object matches', () => {
      // arrange
      socket.user.inventory.push({ displayName: 'bbb' });
      room.inventory.push({ displayName: 'bbb' });

      // act
      const result = sut.autocompleteByProperty(socket.user.inventory, 'displayName', 'a');

      // assert
      expect(result.length).toBe(0);
    });

    it('returns array containing all matching objects when more than one target type matches', () => {
      // arrange
      const userInventoryItem = { displayName: 'aaa' };
      socket.user.inventory.push(userInventoryItem);

      // act
      const result = sut.autocompleteByProperty(socket.user.inventory, 'displayName', 'a');

      // assert
      expect(result.length).toBe(1);
      expect(result.find(({matchedValue, target}) => matchedValue === userInventoryItem.displayName
        && target === 'inventory')).not.toBeNull();
    });
  });

  describe('autocomplete method', () => {

    beforeEach(() => {
      socket = new mocks.SocketMock();
      socket.user = {
        name: 'a user',
        inventory: [],
        keys: [],
      };
      room = mocks.getMockRoom();
      spyOn(Room, 'getById').and.callFake(() => room);
    });

    it('should return object if only displayName has a matching object', () => {
      // arrange
      const inventoryItem = { name: 'aaa', displayName: 'bbb' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'ccc', displayName: 'ddd' };
      room.inventory = [roomItem];

      // act
      const result = sut.autocompleteTypes(socket, ['inventory', 'room'], 'd');

      // assert
      expect(result.type).toBe('room');
      expect(result.item.name).toBe(roomItem.name);
      expect(result.item.displayName).toBe(roomItem.displayName);
    });

    it('should return object if only name has a matching object', () => {
      // arrange
      const inventoryItem = { name: 'aaa', displayName: 'bbb' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'ccc', displayName: 'ddd' };
      room.inventory = [roomItem];

      // act
      const result = sut.autocompleteTypes(socket, ['inventory', 'room'], 'a');

      // assert
      expect(result.item).toBe(inventoryItem);
    });

    it('should return null if neither name or displayName have matching object', () => {
      // arrange
      const inventoryItem = { name: 'aaa', displayName: 'aaa' };
      socket.user.inventory = [inventoryItem];
      const roomItem = { name: 'aaa', displayName: 'aaa' };
      room.inventory = [roomItem];

      // act
      const result = sut.autocompleteTypes(socket, ['inventory', 'room'], 'b');

      // assert
      expect(result).toBeNull();
    });

  });

});
