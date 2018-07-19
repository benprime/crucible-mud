'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
let mockRoom;
let mockTargetSocket;
let otherMockSocket;
let usersInRoom = [];

const sut = SandboxedModule.require('./actionHandler', {
  requires: {
    '../../data/actionData': {  
      actions: {
        hug: {
          solo: {
            roomMessage: '{0} hugs himself.',
            sourceMessage: 'You hug yourself.',
          },
          target: {
            targetMessage: '{0} hugs you close!',
            roomMessage: '{0} hugs {1} close!',
            sourceMessage: 'You hug {1} close!',
          },
        },
        kiss: {
          solo: {
            sourceMessage: 'You pucker up looking for a kiss.',
            roomMessage: '{0} puckers up looking for a kiss.',
          },
          target: {
            targetMessage: '{0} kisses you passionately!',
            roomMessage: '{0} kisses {1} passionately!',
            sourceMessage: 'You kiss {1} passionately!',
          },
        },
      },
    },
    '../models/room': {
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
      usersInRoom: jasmine.createSpy('usersInRoomSpy').and.callFake(() => usersInRoom),
    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockTargetSocket,
    },
  },
  globals: { io: mockGlobalIO },
});

describe('actionHandler', function () {
  let socket;
  let sockets = {};

  describe('actionDispatcher', function () {
    beforeEach(function() {
      mockRoom = mocks.getMockRoom();

      socket = new mocks.SocketMock();
      socket.user.roomId = mockRoom.id;
      sockets[socket.id] = socket;

      usersInRoom.push('aDifferentUser');
      mockTargetSocket = new mocks.SocketMock();
      mockTargetSocket.user.username = 'aDifferentUser';
      mockTargetSocket.user.roomId = mockRoom.id;
      sockets[mockTargetSocket.id] = mockTargetSocket;

      usersInRoom.push('aThirdUser');
      otherMockSocket = new mocks.SocketMock();
      otherMockSocket.user.username = 'aThirdUser';
      otherMockSocket.user.roomId = mockRoom.id;
      sockets[otherMockSocket.id] = otherMockSocket;

      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms[mockRoom.id] = {
        sockets: sockets,
      };
      mockRoom.usersInRoom = jasmine.createSpy('usersInRoomSpy').and.callFake(() => usersInRoom);
    });

    it('should output message when no socket is returned for the user', function () {
      mockTargetSocket = undefined;

      var result = sut.actionDispatcher(socket, 'hug', 'aUser');

      expect(result).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown user: aUser' });
    });

    it('should output message when action is performed on self', function () {
      mockTargetSocket = socket;
  
      var result = sut.actionDispatcher(socket, 'hug', 'aUser');
  
      expect(result).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You hug yourself.' });
      expect(mockGlobalIO.to(otherMockSocket.id).emit).toHaveBeenCalledWith('output', { message: 'TestUser hugs himself.' });
    });

    it('should output message when action is performed on other user', function () {
      var result = sut.actionDispatcher(socket, 'hug', 'aDifferentUser');
  
      expect(result).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You hug aDifferentUser close!' });
      expect(mockGlobalIO.to(otherMockSocket.id).emit).toHaveBeenCalledWith('output', { message: 'TestUser hugs aDifferentUser close!' });
      expect(mockTargetSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser hugs you close!' });
    });

    it('should return false when action is not found', function () {
      var result = sut.actionDispatcher(socket, 'notAnAction', 'aDifferentUser');
  
      expect(result).toBe(false);
    });
  });
});