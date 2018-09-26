import { mockGetRoomById } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './createDoor';
import { getDirection } from '../core/directions';


jest.mock('../models/room');


describe('create', () => {
  let socket;
  let mockRoom;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  describe('execute', () => {

    test('should accept valid direction input', () => {
      const dir = getDirection('n');
      expect.assertions(1);

      return sut.execute(socket.character, dir).then(() => {
        expect(mockRoom.createDoor).toBeCalledWith(dir);
      });
    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });

    test('help should output message', () => {
      sut.help(socket.character);

      expect(socket.character.output).lastCalledWith(expect.stringContaining('Create new room in specified direction'));
    });
  });
});
