'use strict';

//require('../globals');
const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const SocketMock = new require('socket-io-mock');

const sut = require('../../commands/yell');

describe('yell', function () {
  let mockRoom;
  let roomManagerSpy;
  let socket;

  beforeAll(function () {
    mockRoom = mocks.getMockRoom();
    roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => mockRoom);
    socket = new SocketMock();
    socket.user = { roomId: 123 };
  });

  describe('execute', function () {


    it('should', function () {
      // arrange
      const msg = "This is a yelled message!";
      var results = [];

      // passing a spy to the mock callback (it has both room and message)
      var spy = jasmine.createSpy();
      socket.onEmit('output', spy);

      // act
      sut.execute(socket, msg);

      // assert
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from below  \'This is a yelled message!\'' }, 'uRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from above  \'This is a yelled message!\'' }, 'dRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the south  \'This is a yelled message!\'' }, 'nRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the north  \'This is a yelled message!\'' }, 'sRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the west  \'This is a yelled message!\'' }, 'eRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the east  \'This is a yelled message!\'' }, 'wRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the southwest  \'This is a yelled message!\'' }, 'neRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the northwest  \'This is a yelled message!\'' }, 'seRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the southeast  \'This is a yelled message!\'' }, 'nwRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'Someone yells from the northeast  \'This is a yelled message!\'' }, 'swRoomId');
      expect(spy).toHaveBeenCalledWith({ message: 'You yell "This is a yelled message!"' }, undefined);
    });

  });

});