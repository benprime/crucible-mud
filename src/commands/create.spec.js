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

        sut.execute(socket, 'room', 'n');

        expect(mockRoom.createRoom).toBeCalledWith('n', jasmine.any(Function));
        expect(socket.emit).toBeCalledWith('output', { message: 'Room created.' });
        expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `${socket.user.username} waves his hand and an exit appears to the ${longDir}!` });
      });

      test('should output error message when direction in invalid', () => {
        let dir = 'invalid dir';
        sut.execute(socket, 'room', dir);

        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid direction!' });
      });
    });

    describe('when type is door', () => {
      test('should accept valid direction input', () => {
        const dir = 'n';
        mockValidDirectionInput.mockReturnValueOnce('n');
        
        sut.execute(socket, 'door', dir);

        expect(mockRoom.getExit).toBeCalledWith(dir);
        expect(mockRoom.exits.find(r => r.dir === 'n').closed).toBe(true);
        expect(mockRoom.save).toHaveBeenCalled();
      });

      test('should output error message when direction in invalid', () => {
        const dir = 'n';
        mockValidDirectionInput.mockReturnValueOnce('n');
        mockRoom.getExit.mockReturnValueOnce(null);

        sut.execute(socket, 'door', dir);

        expect(mockRoom.getExit).toBeCalledWith(dir);
        expect(mockRoom.save).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'Invalid direction.' });
      });
    });

    test('should output error when create type is invalid', () => {
      sut.execute(socket, 'other', 'n');

      expect(socket.emit).toBeCalledWith('output', { message: 'Invalid create type.' });
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
