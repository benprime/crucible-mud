import { mockGetRoomById, mockValidDirectionInput, mockShortToLong } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import Item from '../models/item';
import mocks from '../../spec/mocks';
import sut from './unlock';

jest.mock('../config');
jest.mock('../models/room');
jest.mock('../core/autocomplete');

const mockRoom = {
  id: 'bogus',
  exits: [
    { dir: 'n', roomId: 'nRoomId', closed: true },
    { dir: 'w', roomId: 'wRoomId', closed: true, keyName: 'Gold', locked: true },
    { dir: 'nw', roomId: 'nwRoomId', closed: true, keyName: 'Silver', locked: true },
    { dir: 'ne', roomId: 'eRoomId', closed: true, keyName: 'Bronze', locked: true },
    { dir: 's', roomId: 'sRoomId' },
  ],
  getExit: jest.fn(dir => mockRoom.exits.find(e => e.dir == dir)).mockName('getExit'),
  save: jest.fn().mockName('roomSave'),
};

global.io = new mocks.IOMock();

describe('unlock', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();

    mockGetRoomById.mockReturnValue(mockRoom);
  });

  test('should output message when direction is invalid', () => {
    return sut.execute(socket.character, 'e', 'some key').catch(response => {
      expect(response).toEqual('No door in that direction.' );
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  test('should output message when a door exists but is not locked', () => {

    mockValidDirectionInput.mockReturnValueOnce('n');

    return sut.execute(socket.character, 'n', 'some key').catch(response => {
      expect(response).toEqual('That door is not locked.' );
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  test('should output no messages when user is not carrying the key', () => {
    mockValidDirectionInput.mockReturnValueOnce('nw');
    mockAutocompleteTypes.mockReturnValueOnce(null);

    return sut.execute(socket.character, 'nw', 'some key').catch(response => {
      expect(response).toBe('You don\'t seem to be carrying that key.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should output message when key is the wrong key for the door', () => {
    const key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Blue';
    mockValidDirectionInput.mockReturnValueOnce('ne');
    mockAutocompleteTypes.mockReturnValueOnce({ item: key });

    return sut.execute(socket.character, 'ne', 'Blue').catch(response => {
      expect(response).toEqual('That key does not unlock that door.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should unlock door with output message when command successful', () => {
    const key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Gold';
    mockValidDirectionInput.mockReturnValueOnce('w');
    mockAutocompleteTypes.mockReturnValueOnce({ item: key });

    return sut.execute(socket.character, 'w', 'Gold').then(response => {
      expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'Door unlocked.' });
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  describe('asyncTest', () => {
    let worked = false;

    beforeEach(() => {
      global.io.reset();
      const key = new Item();
      key.itemTypeEnum = 'key';
      key.name = 'Silver';
      mockValidDirectionInput.mockReturnValueOnce('nw');
      mockShortToLong.mockReturnValueOnce('northwest');
      mockAutocompleteTypes.mockReturnValueOnce({ item: key });
    });

    test('should automatically relock door after timeout', (done) => {

      return sut.execute(socket.character, 'nw', 'Silver', () => {
        worked = true;

        expect(global.io.to('bogus').emit).toHaveBeenCalledWith('output', { message: 'The door to the northwest clicks locked!' });
        expect(mockRoom.save).not.toHaveBeenCalled();
        expect(worked).toBe(true);

        done();
      });

    });
  });
});
