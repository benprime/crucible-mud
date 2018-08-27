import mocks from '../../spec/mocks';
import sut from './gossip';

global.io = new mocks.IOMock();

describe('gossip', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    global.io.reset();
  });

  describe('execute', () => {

    test('should call emit to correct gossip channel', () => {
      // arrange
      const msg = 'This is a gossiped message!';

      // act
      sut.execute(socket.character, msg);
      
      // assert
      expect(global.io.to).toBeCalledWith('gossip');
      expect(global.io.to('gossip').emit).toBeCalledWith('output', { message: '<span class="silver">TestUser gossips: </span><span class="mediumOrchid">This is a gossiped message!</span>' });
    });

  });

});
