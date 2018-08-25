import mocks from '../../spec/mocks';
import sut from './move';

jest.mock('../models/room');
jest.mock('./break');
jest.mock('./look');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();


// TODO: these tests need to be seperated out into tests for the character.move method
describe('move', () => {
  let socket = new mocks.SocketMock();
  socket.character.move = jest.fn(() => Promise.resolve());

  describe('dispatch', () => {
    beforeEach(() => {
      jest.spyOn(sut, 'execute');
    });

    afterEach(() => {
      sut.execute.mockClear();
    });

    test('should call execute with direction match', () => {
      sut.dispatch(socket, ['aMatch']);

      expect(sut.execute).toBeCalledWith(socket.character, 'aMatch');
    });

    test('should call execute with command match', () => {
      sut.dispatch(socket, ['go aMatch', 'aMatch']);

      expect(sut.execute).toBeCalledWith(socket.character, 'aMatch');
    });

    test('should clear leader tracking when user moves', () => {
      socket.leader = 'test';

      sut.dispatch(socket, ['aMatch']);

      expect(socket.character.leader).toBeNull();
    });
  });

  describe('execute', () => {

    test('should call character move method', () => {
      return sut.execute(socket.character, 'u').then(() => {
        expect(socket.character.move).toHaveBeenCalledWith('u');
      });
    });
  });

  describe('help', () => {
    test('should print help message', () => {
      sut.help(socket);

      // let expected = '';
      // expected += '<span class="cyan">move command </span><span class="darkcyan">-</span> Move in specified direction. Move command word is not used.<br />';
      // expected += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
      // expected += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
      // expected += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
      // expected += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
      // expected += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
      // expected += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
      // expected += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
      // expected += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
      // expected += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
      // expected += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br />';

      expect(socket.emit).toHaveBeenCalled();
    });
  });
});
