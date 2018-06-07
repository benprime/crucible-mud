'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
let mockRoom = mocks.getMockRoom();
let mockTargetSocket = new mocks.SocketMock();

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
        wave: {
          solo: {
            roomMessage: '{0} waves farewell!',
            sourceMessage: 'You wave farewell!',
          },
          target: {
            targetMessage: '{0} waves to you!',
            roomMessage: '{0} waves to {1}!',
            sourceMessage: 'You wave to {1}!',
          },
        },
      },
    },
    '../models/room': {
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockTargetSocket,
    },
  },
  globals: { io: mockGlobalIO },
});

describe('actionHandler', function () {
  let socket;
  
  describe('actionDispatcher', function () {
    beforeEach(function() {
      socket = new mocks.SocketMock();
      socket.user.roomId = mockRoom.id;
      let sockets = {};
      sockets[socket.id] = socket;
      mockGlobalIO.sockets.adapter.rooms = {};
      mockGlobalIO.sockets.adapter.rooms[mockRoom.id] = {
        sockets: sockets,
      };
    });

    it('should output message when no socket is returned for the user', function () {
      mockTargetSocket = undefined;

      var result = sut.actionDispatcher(socket, 'hug', 'aUser');

      expect(result).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Unknown user: aUser' });
    });

    fit('should output message when action is performed on self', function () {
      mockTargetSocket = socket;
  
      var result = sut.actionDispatcher(socket, 'hug', 'aUser');
  
      expect(result).toBe(true);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You hug yourself.' });
    });
  });
});