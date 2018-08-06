import mocks from '../../spec/mocks';
import sut from './break';

describe('break', () => {
  let socket;

  describe('execute', () => {

    test('should set appropriate socket state variables when combat underway', () => {
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
      expect(socket.broadcast.to).toBeCalledWith(socket.user.roomId);
      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: 'TestUser breaks off his attack.' });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    });

    test('should not emit messages if combat is not underway', () => {
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
      expect(socket.emit).not.toBeCalledWith();
    });
  });

});
