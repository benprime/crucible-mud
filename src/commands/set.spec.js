import Room, { mockGetById, mockValidDirectionInput, mockShortToLong, mockLongToShort } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './set';

jest.mock('../models/room');

let mockRoom = mocks.getMockRoom();
mockGetById.mockReturnValue(mockRoom);


describe('set', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => {
    socket.reset();
  });

  describe('execute', () => {

    describe('when type is room', () => {
      test('should return error when property not in allowed properties list', () => {
        sut.execute(socket, 'room', 'bad property', 'new value');

        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid property.' });
      });

      test('should update room in room cache and room database object on success', () => {

        sut.execute(socket, 'room', 'name', 'new name value');

        expect(mockRoom.name).toBe('new name value');
        expect(mockRoom.save).toHaveBeenCalled();
        expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser has altered the fabric of reality.' });
      });
    });

    test('should return error when type is not room', () => {
      sut.execute(socket, 'bad type', 'some property', 'new value');

      expect(socket.emit).toBeCalledWith('output', { message: 'Invalid type.' });
    });
  });

});
