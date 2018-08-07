import { mockGetById } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import Item from '../models/item';
import mocks from '../../spec/mocks';
import sut from './drop';

jest.mock('../models/room');
jest.mock('../core/autocomplete');

let mockRoom = mocks.getMockRoom();


describe('drop', () => {
  let socket;
  let item;
  let key;
  let invalidItem;

  beforeAll(() => {
    // just a matcher that works like toEqual, but does not do a type check.
    // This just compares the json representation of the objects being compared.
    jasmine.addMatchers({
      toBeJsonEqual() {
        return {
          compare(actual, expected) {
            let result = {};
            let jsonActual = JSON.orderedStringify(actual);
            let jsonExpected = JSON.orderedStringify(expected);
            result.pass = jsonActual === jsonExpected;
            if (result.pass) {
              result.message = `Expected ${jsonActual} to equal ${jsonExpected}`;
            } else {
              result.message = `Expected ${jsonActual} to equal ${jsonExpected}`;
            }
            return result;
          },
        };
      },
    });
  });

  beforeEach(() => {
    mockRoom.reset();
    mockGetById.mockReturnValueOnce(mockRoom);
    socket = new mocks.SocketMock();

    item = new Item();
    item.name = 'dummyItem';
    item.type = 'item';
    item.displayName = 'dropItem';

    key = new Item();
    key.name = 'dummyKey';
    key.type = 'key';
    key.displayName = 'dropKey';

    invalidItem = new Item();
    invalidItem.name = 'invalidItem';
    invalidItem.type = 'InvalidType';
    invalidItem.displayName = 'invalidDisplayName';

    socket.user.inventory = [item];
    socket.user.keys = [key];
    mockRoom.inventory = [];
  });

  describe('execute', () => {

    describe('when item.type is item', () => {

      test('should output error message when item is not found in user inventory', () => {
        mockAutocompleteTypes.mockReturnValueOnce(null);
        sut.execute(socket, 'non-existent item');

        expect(socket.user.save).not.toHaveBeenCalled();
        expect(mockRoom.save).not.toHaveBeenCalled();
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      });

      test('should remove item from user inventory and add to room inventory', () => {
        let autocompleteResult = {
          type: 'item',
          item,
        };
        mockAutocompleteTypes.mockReturnValueOnce(autocompleteResult);

        sut.execute(socket, 'dropItem');

        expect(socket.user.save).toHaveBeenCalled();
        expect(mockRoom.save).toHaveBeenCalled();
        expect(socket.user.inventory).toHaveLength(0);
        expect(mockRoom.inventory[0].name).toEqual(item.name);
        expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser drops dropItem.' });
        expect(socket.emit).toBeCalledWith('output', { message: 'Dropped.' });
      });
    });

    describe('when item.type is key', () => {
      test('should remove key from user keys and add to room inventory', () => {
        let autocompleteResult = {
          type: 'key',
          item: key,
        };
        mockAutocompleteTypes.mockReturnValueOnce(autocompleteResult);
        socket.user.keys = [autocompleteResult.item];

        sut.execute(socket, 'dropKey');

        expect(socket.user.save).toHaveBeenCalled();
        expect(mockRoom.save).toHaveBeenCalled();
        expect(socket.user.keys).toHaveLength(0);
        expect(mockRoom.inventory[0].name).toEqual(key.name);
        expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser drops dropKey.' });
        expect(socket.emit).toBeCalledWith('output', { message: 'Dropped.' });
      });
    });
  });
});
