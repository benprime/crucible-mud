import { mockGetRoomById } from '../../../models/room';
import { mockAutocompleteMultiple } from '../../../core/autocomplete';
import mocks from '../../../../spec/mocks';
import sut from './lockAction';
import directions from '../../../core/directions';

jest.mock('../../../models/room');
jest.mock('../../../core/autocomplete');

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
    const result = sut.execute(socket.character, directions.W, 'some key');
    expect(result).toBe(false);
    expect(socket.character.output).toHaveBeenCalledWith('No door in that direction.');
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should output message when direction is not a door', () => {
    const result = sut.execute(socket.character, directions.S, 'some key');
    expect(result).toBe(false);
    expect(socket.character.output).toHaveBeenCalledWith('No door in that direction.');
    expect(mockRoom.save).not.toHaveBeenCalled();
  });

  test('should do nothing when key name is invalid', () => {
    const result = sut.execute(socket.character, directions.E, null);
    expect(result).toBe(false);
    expect(socket.character.output).toHaveBeenCalledWith('Unknown key.');
    expect(mockRoom.save).not.toHaveBeenCalled();
  });


  test('should succeed on valid direction with door', () => {
    // arrange
    mockAutocompleteMultiple.mockReturnValueOnce({ item: { name: 'some key' } });


    // act
    const result = sut.execute(socket.character, directions.N, 'some key');
    const exit = mockRoom.exits.find(({ dir }) => dir === 'n');

    // assert
    expect(result).toBe(true);
    expect(socket.character.output).toHaveBeenCalledWith('Door locked.');
    expect(mockRoom.save).toHaveBeenCalledTimes(1);
    expect(exit.closed).toBe(true);
    expect(exit.locked).toBe(true);
  });

});
