import { mockGetRoomById } from '../../../models/room';
import mocks from '../../../../spec/mocks';
import sut from './setAction';

jest.mock('../../../models/room');

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
        const result = sut.execute(socket.character, 'room', 'bad property', 'new value');
        expect(result).toBe(false);
        expect(socket.character.output).toHaveBeenCalledWith('Invalid property.');

      });

      test('should update room in room cache and room database object on success', () => {
        const result = sut.execute(socket.character, 'room', 'name', 'new name value');
        expect(result).toBe(true);
        expect(mockRoom.name).toBe('new name value');
        expect(mockRoom.save).toHaveBeenCalled();
        expect(mockRoom.output).toHaveBeenCalledWith('TestUser has altered the fabric of reality.');

      });
    });

    test('should return error when type is not room', () => {
      const result = sut.execute(socket.character, 'bad type', 'some property', 'new value');
      expect(result).toBe(false);
      expect(socket.character.output).toHaveBeenCalledWith('Invalid type.');
    });

  });
});
