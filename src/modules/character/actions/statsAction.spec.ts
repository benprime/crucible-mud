import mocks from '../../../../spec/mocks';
import sut from './statsAction';

describe('stats', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockClear());

  describe('execute', function () {

    test('should display stat block', function () {
      const result = sut.execute(socket.character);
      expect(result).toBe(true);
      expect(socket.character.output).toHaveBeenCalled();
    });

  });

});
