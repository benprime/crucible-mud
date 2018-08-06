import { mockGetById } from '../models/room';
import { mockGetSocketByUsername } from '../core/socketUtil';
import mocks from '../../spec/mocks';
import { when } from 'jest-when';
import sut from './actionHandler';


jest.mock('../models/room');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();
let mockRoom;
let targetSocket;
let bystanderSocket;
let usersInRoom = [];

describe('actionHandler', () => {
  let socket;
  let sockets = {};

  describe('actionDispatcher', () => {
    beforeEach(() => {
      mockRoom = mocks.getMockRoom();
      mockGetById.mockReturnValue(mockRoom);

      socket = new mocks.SocketMock();
      socket.user.roomId = mockRoom.id;
      when(mockGetSocketByUsername).calledWith(socket.user.username).mockReturnValue(socket);
      sockets[socket.id] = socket;

      usersInRoom.push('aDifferentUser');
      targetSocket = new mocks.SocketMock();
      targetSocket.user.username = 'aDifferentUser';
      targetSocket.user.roomId = mockRoom.id;
      when(mockGetSocketByUsername).calledWith(targetSocket.user.username).mockReturnValue(targetSocket);
      sockets[targetSocket.id] = targetSocket;

      usersInRoom.push('aThirdUser');
      bystanderSocket = new mocks.SocketMock();
      bystanderSocket.user.username = 'aThirdUser';
      bystanderSocket.user.roomId = mockRoom.id;
      when(mockGetSocketByUsername).calledWith(bystanderSocket.user.username).mockReturnValue(bystanderSocket);
      sockets[bystanderSocket.id] = bystanderSocket;

      global.io.sockets.adapter.rooms = {};
      global.io.sockets.adapter.rooms[mockRoom.id] = {
        sockets,
      };
    });

    test('should output message when no socket is returned for the user', () => {
      targetSocket = undefined;

      const result = sut.actionDispatcher(socket, 'hug', 'anUnknownUser');

      expect(result).toBe(true);
      expect(socket.emit).toBeCalledWith('output', { message: 'Unknown user' });
    });

    test('should output message when action is performed on self', () => {
      targetSocket = socket;

      const result = sut.actionDispatcher(socket, 'hug');

      expect(result).toBe(true);
      expect(socket.emit).toBeCalledWith('output', { message: 'You hug yourself.' });
      expect(global.io.to(bystanderSocket.id).emit).toBeCalledWith('output', { message: `${socket.user.username} hugs himself.` });
    });

    test('should output message when action is performed on self using username', () => {
      mockRoom.userInRoom.mockReturnValue(true);
      targetSocket = socket;

      const result = sut.actionDispatcher(socket, 'hug', socket.user.username);

      expect(result).toBe(true);
      expect(socket.emit).toBeCalledWith('output', { message: 'You hug yourself.' });
      expect(global.io.to(bystanderSocket.id).emit).toBeCalledWith('output', { message: `${socket.user.username} hugs himself.` });
    });

    test('should output message when action is performed on other user', () => {
      mockGetSocketByUsername.mockReturnValueOnce(targetSocket);
      mockRoom.userInRoom.mockReturnValue(true);
      const result = sut.actionDispatcher(socket, 'hug', targetSocket.user.username);

      expect(result).toBe(true);
      expect(socket.emit).toBeCalledWith('output', { message: `You hug ${targetSocket.user.username} close!` });
      expect(global.io.to(bystanderSocket.id).emit).toBeCalledWith('output', { message: `${socket.user.username} hugs ${targetSocket.user.username} close!` });
      expect(targetSocket.emit).toBeCalledWith('output', { message: `${socket.user.username} hugs you close!` });
    });

    test('should return false when action is not found', () => {
      const result = sut.actionDispatcher(socket, 'notAnAction', targetSocket.user.username);

      expect(result).toBe(false);
    });
  });
});