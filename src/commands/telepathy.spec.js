'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
let mockReturnSocket = {};
let autocompleteResult = {};
const sut = SandboxedModule.require('./telepathy', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {},
    '../core/socketUtil': {
      'getSocketByUsername' : () => mockReturnSocket,
    },
  },
  globals: { io: mockGlobalIO },
});

describe('telepathy', () => {
  let socket;
  let otherSocket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123, username: 'TestUser' };
    otherSocket = new mocks.SocketMock();
    otherSocket.user = { roomId: 321, username: 'OtherUser' };
  });

  describe('execute', () => {

    it('should output messages when user is invalid', () => {
      // arrange
      const msg = 'This is a telepath message!';
      mockReturnSocket = null;

      // act
      sut.execute(socket, 'Wrong', msg);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Invalid username.' });
    });

    it('should output messages when command is successful', () => {
      // arrange
      const msg = 'This is a telepath message!';
      mockReturnSocket = otherSocket;

      // act
      sut.execute(socket, otherSocket.username, msg);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Telepath to OtherUser: This is a telepath message!' });
      expect(otherSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser telepaths: This is a telepath message!' });
    });

  });

});
