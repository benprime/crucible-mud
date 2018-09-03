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
      expect.assertions(3);

      return sut.execute(socket.character, dir).then(() => {
        expect(mockRoom.getExit).toBeCalledWith(dir.short);
        expect(mockRoom.exits.find(r => r.dir === 'n').closed).toBe(true);
        expect(mockRoom.save).toHaveBeenCalled();
      });
    });

    test('should output error message when direction in invalid', () => {
      const dir = null;
      expect.assertions(2);

      return sut.execute(socket.character, dir).catch(() => {
        expect(mockRoom.save).not.toHaveBeenCalled();
        expect(socket.character.output).toHaveBeenCalledWith('Invalid direction.');
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
