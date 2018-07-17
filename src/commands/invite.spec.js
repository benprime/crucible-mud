'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const mockGlobalIO = new mocks.IOMock();
let mockTargetSocket = new mocks.SocketMock();
let usersInRoomResult = [];
let mockRoom = mocks.getMockRoom();
mockRoom.usersInRoom = jasmine.createSpy('usersInRoomSpy').and.callFake(() => usersInRoomResult);
const sut = SandboxedModule.require('./invite', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,

    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockTargetSocket,
      'usersInRoom': () => usersInRoomResult,
    },
  },
  globals: {io:mockGlobalIO},
});

describe('invite', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();

    // add mock room to io rooms
    mockGlobalIO.sockets.adapter.rooms[mockRoom.id] = mockRoom;
  });

  describe('execute', function () {
    usersInRoomResult = ['TestUser', 'aUser', 'TargetUser'];

    beforeEach(function () {
      mockTargetSocket.user.username = 'TargetUser';

      mockGlobalIO.addUserToIORoom(mockRoom.id, mockTargetSocket);

      socket.user.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.user.username = 'TestUser';
      socket.emit.calls.reset();

      mockTargetSocket.partyInvites = new Set();
      mockTargetSocket.partyInvites.add(socket.user.id);
    });

    it('adds invite to socket tracking variable of recipient socket', function () {
      let username = 'TargetUser';

      sut.execute(socket, username);

      expect(mockTargetSocket.partyInvites.has(socket.user.id)).toBeTruthy();
    });

  });
});
