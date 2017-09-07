'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');

const sut = require('../../commands/yell');

describe('yell', function () {
  let mockRoom;
  let roomManagerSpy;
  let socket;

  beforeAll(function () {
    mockRoom = mocks.getMockRoom();
    roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => mockRoom);
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123 };
  });

  describe('execute', function () {


    it('should', function () {
      // arrange
      const msg = "This is a yelled message!";
      var results = [];

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toHaveBeenCalledWith('uRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from below  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('dRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from above  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('nRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the south  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('sRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the north  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('eRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the west  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('wRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the east  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('neRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the southwest  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('seRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the northwest  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('nwRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the southeast  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith('swRoomId');
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the northeast  \'This is a yelled message!\'' });

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You yell \'This is a yelled message!\'' });

    });

  });

});