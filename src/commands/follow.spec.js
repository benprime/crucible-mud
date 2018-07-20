const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockInvitingSocket = new mocks.SocketMock();
mockInvitingSocket.user.username = 'InvitingUser';
let mockRoom = mocks.getMockRoom();
let validUserInRoomResult = mockInvitingSocket;
const sut = SandboxedModule.require('./follow', {
  requires: {
    '../models/room': {
      getById: () => mockRoom,

    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockInvitingSocket,
      'validUserInRoom': () => validUserInRoomResult,
    },
  },
});

describe('follow', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  describe('execute', () => {

    beforeEach(() => {

      socket.emit.calls.reset();

      socket.partyInvites = [mockInvitingSocket.user.id];
    });

    it('sets socket leader tracking variable and clears follow invite when user follows user', () => {
      sut.execute(socket, mockInvitingSocket.user.username);

      expect(socket.partyInvites.length).toBe(0);
    });

    // this feature is not yet implemented
    xit('transfers any current followers to the new leader\'s party', () => {
      fail('not completed');
    });

  });
});
