import { mockGetRoomById, mockValidDirectionInput } from '../models/room';
import { mockAutocompleteMultiple } from '../core/autocomplete';
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
        { dir: 'e', roomId: 'eRoomId', closed: true },
      ],
      getExit: jest.fn(dir => mockRoom.exits.find(e => e.dir == dir)).mockName('getExit'),
      save: jest.fn().mockName('roomSave'),
    };
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  test('should output message when direction is invalid', () => {
    mockValidDirectionInput.mockReturnValueOnce('w');
    return sut.execute(socket.character, 'w', 'some key').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('No door in that direction.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });
  });

  test('should output message when direction is not a door', () => {
    mockValidDirectionInput.mockReturnValueOnce('s');
    expect.assertions(2);

    return sut.execute(socket.character, 's', 'some key').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('No door in that direction.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });


  });

  test('should do nothing when key name is invalid', () => {
    mockValidDirectionInput.mockReturnValueOnce('e');
    expect.assertions(2);
    return sut.execute(socket.character, 'e', 'invalid key name').catch(() => {
      expect(socket.character.output).toHaveBeenCalledWith('Unknown key.');
      expect(mockRoom.save).not.toHaveBeenCalled();
    });

  });


  test('should succeed on valid direction with door', () => {
    // arrange
    mockValidDirectionInput.mockReturnValueOnce('n');
    mockAutocompleteMultiple.mockReturnValueOnce({ item: { name: 'some key' } });
    expect.assertions(4);

    // act
    return sut.execute(socket.character, 'n', 'some key').then(() => {
      const exit = mockRoom.exits.find(({ dir }) => dir === 'n');

      // assert
      expect(socket.character.output).toHaveBeenCalledWith('Door locked.');
      expect(mockRoom.save).toHaveBeenCalledTimes(1);
      expect(exit.closed).toBe(true);
      expect(exit.locked).toBe(true);
    });

  });

  test('should be an admin command', () => {
    expect(sut.admin).toBe(true);
  });

});
