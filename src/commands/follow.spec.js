'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockInvitingSocket;
let usersInRoomResult = [];
let mockRoom = mocks.getMockRoom();
mockRoom.usersInRoom = jasmine.createSpy('usersInRoomSpy').and.callFake(() => usersInRoomResult);
const sut = SandboxedModule.require('./follow', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,

    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockInvitingSocket,
      'usersInRoom': () => usersInRoomResult,
    },
  },
});

describe('follow', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    usersInRoomResult = ['TestUser', 'aUser', 'InvitingUser'];

    beforeEach(function () {
      mockInvitingSocket = new mocks.SocketMock();
      mockInvitingSocket.user.username = 'InvitingUser';
      socket.user.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.user.username = 'TestUser';
      socket.emit.calls.reset();

      mockInvitingSocket.partyInvites = new Set();
      mockInvitingSocket.partyInvites.add(socket.user.id);
    });

    it('sets socket leader tracking variable and clears follow invite when user follows user', function () {
      sut.execute(socket, mockInvitingSocket.user.username);

      expect(mockInvitingSocket.partyInvites.length).toBe(0);
    });

    it('can only follow players that are in the current room', function () {

    });

    // this feature is not yet implemented
    xit('transfers any current followers to the new leader\'s party', function () {
      fail('not completed');
    });

  });
});
