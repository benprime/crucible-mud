import { mockGetRoomById, mockValidDirectionInput } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './lock';


jest.mock('../models/room');
jest.mock('../core/autocomplete');

let mockRoom;


describe('lock', () => {
  let socket;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = {
      exits: [
        { dir: 'n', roomId: 'uRoomId', closed: true },
        { dir: 's', roomId: 'nRoomId' },
      ],
      getExit: jest.fn(dir => mockRoom.exits.find(e => e.dir == dir)).mockName('getExit'),
      save: jest.fn().mockName('roomSave'),
    };
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  test('should output message when direction is invalid', () => {
    sut.execute(socket, 'e', 'some key');

    expect(socket.emit).toBeCalledWith('output', { message: 'No door in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output message when direction is not a door', () => {
    sut.execute(socket, 's', 'some key');

    expect(socket.emit).toBeCalledWith('output', { message: 'No door in that direction.' });
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should do nothing when key name is invalid', () => {
    sut.execute(socket, 'n', 'invalid key name');

    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should succeed on valid direction with door', () => {
    // arrange
    mockValidDirectionInput.mockReturnValueOnce('n');
    mockAutocompleteTypes.mockReturnValueOnce({item: {name: 'key', displayName: 'some key'}});

    // act
    sut.execute(socket, 'n', 'some key');
    const exit = mockRoom.exits.find(({dir}) => dir === 'n');

    // assert
    expect(socket.emit).toBeCalledWith('output', { message: 'Door locked.' });
    expect(mockRoom.save).toHaveBeenCalledTimes(1);
    expect(exit.closed).toBe(true);
    expect(exit.locked).toBe(true);
  });

  test('should be an admin command', () => {
    expect(sut.admin).toBe(true);
  });

});
