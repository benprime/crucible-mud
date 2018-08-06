import { mockGetById, mockValidDirectionInput, mockShortToLong } from '../models/room';
import mocks from '../../spec/mocks';
import sut from './open';


jest.mock('../models/room');

let mockRoom = mocks.getMockRoom();

describe('open', () => {
  let socket;

  beforeAll(() => {
    mockRoom = {
      inventory: [],
      mobs: [],
      exits: [
        { dir: 'n', roomId: 'nRoomId', closed: true },
        { dir: 's', roomId: 'sRoomId', closed: false },
        { dir: 'e', roomId: 'eRoomId', keyName: 'someKey', locked: true, closed: true },
        { dir: 'w', roomId: 'wRoomId', keyName: 'someKey', locked: false, closed: false },
        { dir: 'se', roomId: 'seRoomId', keyName: 'someKey', locked: false, closed: true },
        { dir: 'sw', roomId: 'swRoomId' },
      ],
    };
    mockGetById.mockReturnValue(mockRoom);
  });

  beforeEach(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {
    test('should output message when direction is invalid', () => {
      mockValidDirectionInput.mockReturnValueOnce(null);

      sut.execute(socket, 'ne');

      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toBeCalledWith('output', { message: 'There is no exit in that direction!' });
    });

    test('should output message when direction has no door', () => {
      mockValidDirectionInput.mockReturnValueOnce('sw');
      
      sut.execute(socket, 'sw');
      const exit = mockRoom.exits.find(({dir}) => dir === 'sw');

      expect(exit.hasOwnProperty('closed')).toBe(false);
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).toBeCalledWith('output', { message: 'There is no door in that direction!' });
    });

    describe('when key is associated', () => {
      test('should fail and output message when door is locked and closed', () => {
        mockValidDirectionInput.mockReturnValueOnce('e');
        
        sut.execute(socket, 'e');
        const exit = mockRoom.exits.find(({dir}) => dir === 'e');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(true);
        expect(exit.closed).toBe(true);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'That door is locked.' });
      });

      test('should succeed and output message when door is unlocked and closed', () => {
        mockValidDirectionInput.mockReturnValueOnce('se');
        mockShortToLong.mockReturnValueOnce('southeast');
        
        sut.execute(socket, 'se');
        const exit = mockRoom.exits.find(({dir}) => dir === 'se');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser opens the door to the southeast.' });
        expect(socket.emit).toBeCalledWith('output', { message: 'Door opened.' });
      });

      test('should send messages when door and is unlocked and open', () => {
        mockValidDirectionInput.mockReturnValueOnce('w');
        
        
        sut.execute(socket, 'w');
        const exit = mockRoom.exits.find(({dir}) => dir === 'w');

        expect(exit.keyName).toBe('someKey');
        expect(exit.locked).toBe(false);
        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'That door is already open.' });
      });
    });

    describe('when no key is associated', () => {
      test('should output message when door is closed', () => {
        mockValidDirectionInput.mockReturnValueOnce('n');
        mockShortToLong.mockReturnValueOnce('north');
        sut.execute(socket, 'n');
        const exit = mockRoom.exits.find(({dir}) => dir === 'n');

        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser opens the door to the north.' });
        expect(socket.emit).toBeCalledWith('output', { message: 'Door opened.' });
      });

      test('should output message when door and is open', () => {
        mockValidDirectionInput.mockReturnValueOnce('s');
        sut.execute(socket, 's');
        const exit = mockRoom.exits.find(({dir}) => dir === 's');

        expect(exit.closed).toBe(false);
        expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
        expect(socket.emit).toBeCalledWith('output', { message: 'That door is already open.' });
      });
    });


  });
});
