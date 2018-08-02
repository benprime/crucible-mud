import Room, { mockGetById, mockValidDirectionInput, mockShortToLong, mockLongToShort } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import autocomplete from '../core/autocomplete';
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
    //global.io.reset();
    socket = new mocks.SocketMock();

    mockGetById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    // socket.emit.mockReset();
    // mockRoom.save.mockReset();
    // autocomplete.autocompleteTypes.mockReset();
  });

  test('should output message when direction is invalid', () => {
    sut.execute(socket, 'e', 'some key');

    expect(socket.emit).toBeCalledWith('output', { message: 'No door in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output message when a door exists but is not locked', () => {

    mockValidDirectionInput.mockReturnValueOnce('n');

    sut.execute(socket, 'n', 'some key');

    expect(socket.emit).toBeCalledWith('output', { message: 'That door is not locked.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output no messages when user is not carrying the key', () => {
    mockValidDirectionInput.mockReturnValueOnce('nw');
    mockAutocompleteTypes.mockReturnValueOnce(null);

    sut.execute(socket, 'nw', 'some key');

    expect(socket.emit).toHaveBeenCalledWith('output', {"message": "You don't seem to be carrying that key."});
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output message when key is the wrong key for the door', () => {
    const key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Blue';
    mockValidDirectionInput.mockReturnValueOnce('ne');
    mockAutocompleteTypes.mockReturnValueOnce(key);

    sut.execute(socket, 'ne', 'Blue');

    expect(socket.emit).toBeCalledWith('output', { message: 'That key does not unlock that door.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should unlock door with output message when command successful', () => {
    const key = new Item();
    key.itemTypeEnum = 'key';
    key.name = 'Gold';
    mockValidDirectionInput.mockReturnValueOnce('w');
    mockAutocompleteTypes.mockReturnValueOnce(key);

    sut.execute(socket, 'w', 'Gold');

    expect(socket.emit).toBeCalledWith('output', { message: 'Door unlocked.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  describe('asyncTest', () => {
    let worked = false;
    
    beforeEach(done => {
      global.io.reset();
      const key = new Item();
      key.itemTypeEnum = 'key';
      key.name = 'Silver';
      mockValidDirectionInput.mockReturnValueOnce('nw');
      mockShortToLong.mockReturnValueOnce('northwest');
      mockAutocompleteTypes.mockReturnValueOnce(key);

      sut.execute(socket, 'nw', 'Silver', () => {
        worked = true;
        done();
      });
    });

    test('should automatically relock door after timeout', () => {
      expect(global.io.to('bogus').emit).toHaveBeenCalledWith('output', { message: 'The door to the northwest clicks locked!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(worked).toBe(true);
    });
  });
});
