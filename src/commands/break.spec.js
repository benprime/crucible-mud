'use strict';

const mocks = require('../../mocks');
const sut = require('../commands/break');

describe('break', function () {
  let socket;

  describe('execute', function () {

    it('should set appropriate socket state variables when combat underway', function () {
      // arrange
      socket = new mocks.SocketMock();
      socket.user = {
        roomId: '123',
        username: 'TestUser',
        attackInterval: 1,
        lastAttack: 1,
        attackTarget: 1,
      };

      // act
      sut.execute(socket);

      // assert
      expect(socket.user.attackInterval).toBeUndefined();
      expect(socket.user.lastAttack).toBeUndefined();
      expect(socket.user.attackTarget).toBeUndefined();
      expect(socket.broadcast.to).toHaveBeenCalledWith(socket.user.roomId);
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: 'TestUser breaks off his attack.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    });

    it('should not emit messages if combat is not underway', function () {
      // arrange
      socket = new mocks.SocketMock();
      socket.user = {
        roomId: 123,
        username: 'TestUser',
        attackInterval: undefined,
        lastAttack: undefined,
        attackTarget: undefined,
      };

      // act
      sut.execute(socket);

      // assert
      expect(socket.user.attackInterval).toBeUndefined();
      expect(socket.user.lastAttack).toBeUndefined();
      expect(socket.user.attackTarget).toBeUndefined();
      expect(socket.broadcast.to).not.toHaveBeenCalled();
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
      expect(socket.emit).not.toHaveBeenCalledWith();
    });
  });

});
