import { mockGetRoomById } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './create';
import directions, { getDirection } from '../core/directions';


jest.mock('../models/room');


describe('create', () => {
  let socket;
  let longDir = 'north';
  let mockRoom;

  beforeEach(() => {
    socket = new mocks.SocketMock();
    mockRoom = mocks.getMockRoom();
    mockGetRoomById.mockReturnValue(mockRoom);
  });

  describe('execute', () => {

    describe('when type is room', () => {
      test('should accept valid forms of direction input', () => {
        expect.assertions(3);

        return sut.execute(socket.character, 'room', directions.N).then(() => {
          expect(mockRoom.createRoom).toBeCalledWith(directions.N);
          expect(socket.character.output).toHaveBeenCalledWith('Room created.');
          expect(socket.character.toRoom).toHaveBeenCalledWith(`${socket.character.name} waves his hand and an exit appears to the ${longDir}!`, [socket.character.id]);
        });

      });

      test('should output error message when direction in invalid', () => {
        let dir = undefined;
        expect.assertions(1);

        return sut.execute(socket.character, 'room', dir).catch(() => {
          expect(socket.character.output).toHaveBeenCalledWith('Invalid direction!');
        });

      });
    });

    describe('when type is door', () => {
      test('should accept valid direction input', () => {
        const dir = getDirection('n');
        expect.assertions(3);

        return sut.execute(socket.character, 'door', dir).then(() => {
          expect(mockRoom.getExit).toBeCalledWith(dir.short);
          expect(mockRoom.exits.find(r => r.dir === 'n').closed).toBe(true);
          expect(mockRoom.save).toHaveBeenCalled();
        });
      });

      test('should output error message when direction in invalid', () => {
        const dir = getDirection('n');
        mockRoom.getExit.mockReturnValueOnce(null);
        expect.assertions(3);

        return sut.execute(socket.character, 'door', dir).catch(() => {
          expect(mockRoom.getExit).toBeCalledWith(dir.short);
          expect(mockRoom.save).not.toHaveBeenCalled();
          expect(socket.character.output).toHaveBeenCalledWith('Invalid direction.');
        });


      });
    });

    test('should output error when create type is invalid', () => {
      expect.assertions(1);

      return sut.execute(socket.character, 'other', directions.N).catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('Invalid create type.');
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
