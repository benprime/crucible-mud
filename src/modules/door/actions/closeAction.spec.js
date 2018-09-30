import { mockGetRoomById } from '../../../models/room';
import directions from '../../../core/directions';
import mocks from '../../../../spec/mocks';
import sut from './closeAction';

jest.mock('../../../models/room');


describe('close', () => {
  let socket;
  let mockRoom;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
    mockRoom.exits = [
      { dir: 'n', roomId: 'nRoomId', closed: true },
      { dir: 's', roomId: 'sRoomId', closed: false },
      { dir: 'e', roomId: 'eRoomId' },
      { dir: 'w', roomId: 'wRoomId' },
    ];
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  describe('closeDoor', () => {

    test('should print message on invalid direction', () => {
      const result = sut.execute(socket.character, directions.NE);

      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('There is no exit in that direction!');
    });


    test('should print message when no door exists in valid direction', () => {
      const result = sut.execute(socket.character, directions.E);
      expect(socket.character.output).toHaveBeenCalledWith('There is no door in that direction!');
      expect(result).toBe(false);
    });

    test('should be succesful when door is open', () => {
      const result = sut.execute(socket.character, directions.S);

      expect(result).toBe(true);
    });

    test('should be succesful when door is already closed', () => {
      const result = sut.execute(socket.character, directions.N);

      expect(result).toBe(true);
    });
  });

});
