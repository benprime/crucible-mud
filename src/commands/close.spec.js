import { mockGetById, mockValidDirectionInput, mockShortToLong, mockLongToShort } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './close';

jest.mock('../models/room');
let mockRoom;
const socket = new mocks.SocketMock();
global.io = new mocks.IOMock();


describe('close', () => {

  describe('execute', () => {

    beforeEach(() => {
      mockRoom = {
        id: socket.user.roomId,
        inventory: [],
        mobs: [],
        exits: [
          { dir: 'n', roomId: 'nRoomId', closed: true },
          { dir: 's', roomId: 'sRoomId', closed: false },
          { dir: 'e', roomId: 'eRoomId' },
          { dir: 'w', roomId: 'wRoomId' },
        ]
      };
      mockGetById.mockReturnValue(mockRoom);
    });

    test('should print message on invalid direction', () => {
      mockValidDirectionInput.mockReturnValueOnce('ne');
      sut.execute(socket, 'ne');

      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenLastCalledWith('output', { message: 'There is no exit in that direction!' });
    });

    test('should print message when no door exists in valid direction', () => {
      mockValidDirectionInput.mockReturnValueOnce('e');

      sut.execute(socket, 'e');
      const exit = mockRoom.exits.find(({ dir }) => dir === 'e');

      expect(exit.hasOwnProperty('closed')).toBe(false);
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toHaveBeenLastCalledWith('output', { message: 'There is no door in that direction!' });
    });

    test('should be succesful when door is open', () => {
      mockValidDirectionInput.mockReturnValueOnce('s');
      mockShortToLong.mockReturnValueOnce('south');

      sut.execute(socket, 's');
      const exit = mockRoom.exits.find(({ dir }) => dir === 's');

      expect(exit.closed).toBe(true);
      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser closes the door to the south.' });
      expect(socket.emit).toHaveBeenLastCalledWith('output', { message: 'Door closed.' });
    });

    test('should be succesful when door is already closed', () => {
      mockValidDirectionInput.mockReturnValueOnce('n');
      mockShortToLong.mockReturnValueOnce('north');

      sut.execute(socket, 'n');

      const exit = mockRoom.exits.find(({ dir }) => dir === 'n');
      expect(exit.closed).toBe(true);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenLastCalledWith('output', { message: 'TestUser closes the door to the north.' });
      expect(socket.emit).toHaveBeenLastCalledWith('output', { message: 'Door closed.' });
    });

  });

});
