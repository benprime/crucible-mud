import { mockGetRoomById, mockValidDirectionInput, mockShortToLong } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './create';


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

  // describe('dispatch triggers execute', () => {
  //   let executeSpy;

  //   beforeAll(() => {
  //     executeSpy = spyOn(sut, 'execute');
  //   });

  //   test('with type and param', () => {
  //     let type = 'room';
  //     let param = 'thing';
  //     sut.dispatch(socket, ['create', type, param]);

  //     expect(executeSpy).toBeCalledWith(socket, type, param);
  //   });
  // });

  describe('execute', () => {

    describe('when type is room', () => {
      test('should accept valid forms of direction input', () => {
        mockValidDirectionInput.mockReturnValueOnce('n');
        mockShortToLong.mockReturnValueOnce('north');

        return sut.execute(socket.character, 'room', 'n').then(response => {
          expect(mockRoom.createRoom).toBeCalledWith('n');
          expect(response.charMessages).toContainEqual({ charId: socket.character.id, message: 'Room created.' });
          expect(response.roomMessages).toContainEqual({ roomId: socket.character.roomId, message: `${socket.character.name} waves his hand and an exit appears to the ${longDir}!`, exclude: [socket.character.id] });
        });

      });

      test('should output error message when direction in invalid', () => {
        let dir = 'invalid dir';
        return sut.execute(socket.character, 'room', dir).catch(response => {
          expect(response).toEqual('Invalid direction!');
        });

      });
    });

    describe('when type is door', () => {
      test('should accept valid direction input', () => {
        const dir = 'n';
        mockValidDirectionInput.mockReturnValueOnce('n');

        return sut.execute(socket.character, 'door', dir).then(response => {
          expect(mockRoom.getExit).toBeCalledWith(dir);
          expect(mockRoom.exits.find(r => r.dir === 'n').closed).toBe(true);
          expect(mockRoom.save).toHaveBeenCalled();
        });
      });

      test('should output error message when direction in invalid', () => {
        const dir = 'n';
        mockValidDirectionInput.mockReturnValueOnce('n');
        mockRoom.getExit.mockReturnValueOnce(null);

        return sut.execute(socket.character, 'door', dir).catch(response => {
          expect(mockRoom.getExit).toBeCalledWith(dir);
          expect(mockRoom.save).not.toHaveBeenCalled();
          expect(response).toEqual('Invalid direction.');
        });


      });
    });

    test('should output error when create type is invalid', () => {
      return sut.execute(socket.character, 'other', 'n').catch(response => {
        expect(response).toEqual('Invalid create type.');
      });


    });

    test('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });

    test('help should output message', () => {
      sut.help(socket);

      expect(socket.emit.mock.calls[0][1].message).toContain('<span class="mediumOrchid">create room &lt;dir&gt; </span><span class="purple">-</span> Create new room in specified direction.<br />');
    });
  });
});
