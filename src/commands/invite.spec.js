'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const mockGlobalIO = new mocks.IOMock();
let mockTargetSocket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
let validUserInRoomResult = mockTargetSocket;
const sut = SandboxedModule.require('./invite', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,

    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockTargetSocket,
      'validUserInRoom': () => validUserInRoomResult,
    },
  },
  globals: { io: mockGlobalIO },
});

describe('invite', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();

    // add mock room to io rooms
    mockGlobalIO.sockets.adapter.rooms[mockRoom.id] = mockRoom;
  });

  describe('execute', () => {

    beforeEach(() => {
      mockTargetSocket.user.username = 'TargetUser';

      mockGlobalIO.addUserToIORoom(mockRoom.id, mockTargetSocket);

      socket.user.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.user.username = 'TestUser';
      socket.emit.calls.reset();
    });

    it('adds invite to socket tracking variable of recipient socket', () => {
      let username = 'TargetUser';

      sut.execute(socket, username);

      expect(mockTargetSocket.partyInvites).toContain(socket.user.id);
    });

  });
});
