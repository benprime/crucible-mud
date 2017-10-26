'use strict';

const Room = require('../../models/room');
const mocks = require('../mocks');

const sut = require('../../commands/yell');

xdescribe('yell', function () {
  let room;
  let socket;

  beforeAll(function () {
    room = mocks.getMockRoom();
    spyOn(Room, 'getById').and.callFake(() => room);
    socket = new mocks.SocketMock();
    socket.user = { roomId: 123 };
  });

  describe('execute', function () {

    it('should', function () {
      // arrange
      const msg = 'This is a yelled message!';

      // act
      sut.execute(socket, msg);

      // assert
      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.u);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from below  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.d);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from above  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.n);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the south  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.s);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the north  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.e);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the west  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.w);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the east  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.ne);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the southwest  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.se);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the northwest  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.nw);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the southeast  \'This is a yelled message!\'' });

      expect(socket.broadcast.to).toHaveBeenCalledWith(room.roomIds.sw);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'Someone yells from the northeast  \'This is a yelled message!\'' });

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You yell \'This is a yelled message!\'' });

    });

  });

});