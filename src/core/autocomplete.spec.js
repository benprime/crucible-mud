import { mockGetRoomById } from '../models/room';
import sut from './autocomplete';
import mocks from '../../spec/mocks';
import Item from '../models/item';


jest.mock('../models/room');

describe('autocomplete', () => {
  let socket;
  let room;

  describe('byProperty', () => {

    beforeEach(() => {
      socket = new mocks.SocketMock();
      socket.user = {
        name: 'a user',
        inventory: [],
        keys: [],
      };
      room = mocks.getMockRoom();
      mockGetRoomById.mockReturnValue(room);
    });

    test('returns object when only one target type has a match', () => {
      // arrange
      const testObj = { name: 'test name' };
      socket.character.inventory = [testObj];

      // act
      const result = sut.byProperty(socket.character.inventory, 'name', 'tes');

      // assert
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('test name');
    });

    test('returns empty array when no object matches', () => {
      // arrange
      socket.character.inventory.push({ name: 'bbb' });
      room.inventory.push({ name: 'bbb' });

      // act
      const result = sut.byProperty(socket.character.inventory, 'name', 'a');

      // assert
      expect(result).toHaveLength(0);
    });

    test('returns array containing all matching objects when more than one target type matches', () => {
      // arrange
      const userInventoryItem = { name: 'aaa' };
      socket.character.inventory.push(userInventoryItem);

      // act
      const result = sut.byProperty(socket.character.inventory, 'name', 'a');

      // assert
      expect(result).toHaveLength(1);
      expect(result.find(({ matchedValue, target }) => matchedValue === userInventoryItem.name
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
      mockGetRoomById.mockReturnValue(room);
    });

    test('room should return object if only name has a matching object', () => {
      // arrange
      const inventoryItem = { name: 'aaa' };
      socket.character.inventory = [inventoryItem];
      const roomItem = { name: 'bbb' };
      room.inventory = [roomItem];

      // act
      const result = sut.multiple(socket.character, ['inventory', 'room'], 'b');

      // assert
      expect(result.type).toBe('room');
      expect(result.item.name).toBe(roomItem.name);
      expect(result.item.name).toBe(roomItem.name);
    });

    test('inventory should return object if only name has a matching object', () => {
      // arrange
      const inventoryItem = new Item({ name: 'aaa' });
      socket.character.inventory = [inventoryItem];
      const roomItem = new Item({ name: 'bbb' });
      room.inventory = [roomItem];

      // act
      const result = sut.multiple(socket.character, ['inventory', 'room'], 'a');

      // assert
      expect(result.item.id).toBe(inventoryItem.id);
    });

    test('should return null if neither name or name have matching object', () => {
      // arrange
      const inventoryItem = { name: 'aaa' };
      socket.character.inventory = [inventoryItem];
      const roomItem = { name: 'aaa' };
      room.inventory = [roomItem];

      // act
      const result = sut.multiple(socket.character, ['inventory', 'room'], 'b');

      // assert
      expect(result).toBeNull();
    });

  });

});
