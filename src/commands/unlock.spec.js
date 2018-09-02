import { mockGetRoomById, mockValidDirectionInput, mockShortToLong } from '../models/room';
import { mockAutocompleteMultiple } from '../core/autocomplete';
import { mockRoomMessage } from '../core/socketUtil';
import Item from '../models/item';
import mocks from '../../spec/mocks';
import sut from './unlock';

jest.mock('../config');
jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

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
    expect.assertions(2);

    return sut.execute(socket.character, 'e', 'some key').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('No door in that direction.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  test('should output message when a door exists but is not locked', () => {
    mockValidDirectionInput.mockReturnValueOnce('n');
    expect.assertions(2);

    return sut.execute(socket.character, 'n', 'some key').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('That door is not locked.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  test('should output no messages when user is not carrying the key', () => {
    mockValidDirectionInput.mockReturnValueOnce('nw');
    mockAutocompleteMultiple.mockReturnValueOnce(null);
    expect.assertions(2);

    return sut.execute(socket.character, 'nw', 'some key').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('You don\'t seem to be carrying that key.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should output message when key is the wrong key for the door', () => {
    const key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Blue';
    mockValidDirectionInput.mockReturnValueOnce('ne');
    mockAutocompleteMultiple.mockReturnValueOnce({ item: key });
    expect.assertions(2);

    return sut.execute(socket.character, 'ne', 'Blue').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('That key does not unlock that door.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should unlock door with output message when command successful', () => {
    const key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Gold';
    mockValidDirectionInput.mockReturnValueOnce('w');
    mockAutocompleteMultiple.mockReturnValueOnce({ item: key });
    expect.assertions(2);

    return sut.execute(socket.character, 'w', 'Gold').then(() => {
      expect(socket.character.output).toHaveBeenCalledWith('Door unlocked.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });

  describe('asyncTest', () => {

    beforeEach(() => {
      global.io.reset();
      const key = new Item();
      key.itemTypeEnum = 'key';
      key.name = 'Silver';
      mockValidDirectionInput.mockReturnValueOnce('nw');
      mockShortToLong.mockReturnValueOnce('northwest');
      mockAutocompleteMultiple.mockReturnValueOnce({ item: key });
    });

    test('should automatically relock door after timeout', (done) => {

      const exit = mockRoom.exits.find(e => e.dir === 'nw');
      expect.assertions(4);

      return sut.execute(socket.character, 'nw', 'Silver', () => {

        expect(mockRoomMessage).toHaveBeenCalledWith('bogus', 'The door to the northwest clicks locked!');
        expect(exit.closed).toBe(true);
        expect(exit.keyName).toBe('Silver');
        expect(mockRoom.save).not.toHaveBeenCalled();

        done();
      });

    });
  });
});
