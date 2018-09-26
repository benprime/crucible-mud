import { mockGetRoomById } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './set';

jest.mock('../models/room');

let mockRoom = mocks.getMockRoom();
mockGetRoomById.mockReturnValue(mockRoom);


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
        expect.assertions(1);

        return sut.execute(socket.character, 'room', 'bad property', 'new value').catch(() => {
          expect(socket.character.output).toHaveBeenCalledWith('Invalid property.');
        });

      });

      test('should update room in room cache and room database object on success', () => {
        expect.assertions(3);

        return sut.execute(socket.character, 'room', 'name', 'new name value').then(() => {
          expect(mockRoom.name).toBe('new name value');
          expect(mockRoom.save).toHaveBeenCalled();
          expect(socket.character.toRoom).toHaveBeenCalledWith('TestUser has altered the fabric of reality.', [socket.character.id]);
        });

      });
    });

    test('should return error when type is not room', () => {
      expect.assertions(1);
      return sut.execute(socket.character, 'bad type', 'some property', 'new value').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('Invalid type.');
      });

    });
  });

});
