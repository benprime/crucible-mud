'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

let mockGlobalIO = new mocks.IOMock();
let mockTargetSocket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
const sut = SandboxedModule.require('./summon', {
  requires: {
    '../core/autocomplete': {},
    '../models/room': {
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockTargetSocket,
    },

  },
  globals: { io: mockGlobalIO },
});

describe('summon', () => {
  let socket;
  let otherRoom;

  beforeEach(() => {
    mockRoom.name = 'OLD';
    otherRoom = mocks.getMockRoom();
    otherRoom.name = 'NEW';

    // acting admin socket
    socket = new mocks.SocketMock();
    socket.user.roomId = mockRoom.id;
    socket.user.username = 'TestUser';

    // target user socket
    mockTargetSocket = new mocks.SocketMock();
    mockTargetSocket.user.roomId = otherRoom.id;
    mockTargetSocket.user.username = 'OtherUser';

  });

  describe('execute', () => {
    it('should output message when user is not found', () => {
      mockTargetSocket = null;
      sut.execute(socket, 'Wrong');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Player not found.' });
    });

    it('should join target user to admin room and leave current room', () => {
      // arrange
      mockTargetSocket.user.roomId = otherRoom.id;

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(mockTargetSocket.leave).toHaveBeenCalledWith(otherRoom._id);
      expect(mockTargetSocket.join).toHaveBeenCalledWith(mockRoom._id);
    });

    it('should update target user room id and save user to database', () => {
      // arrange
      mockTargetSocket.user.roomId = otherRoom.id;

      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(mockTargetSocket.user.roomId).toEqual(mockRoom._id);
      expect(mockTargetSocket.user.save).toHaveBeenCalled();
    });

    it('should output messages when command successful', () => {
      // act
      sut.execute(socket, 'OtherUser');

      // assert
      expect(mockTargetSocket.emit).toHaveBeenCalledWith('output', { message: 'You were summoned to TestUser\'s room!' });
      expect(mockTargetSocket.broadcast.to(mockTargetSocket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'OtherUser appears out of thin air!' });
    });

    it('should be an admin command', () => {
      expect(sut.admin).toBe(true);
    });
  });
});
