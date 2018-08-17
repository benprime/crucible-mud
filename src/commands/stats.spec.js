import mocks from '../../spec/mocks';
import sut from './stats';

describe('stats', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockClear());

  describe('execute', function () {

    test('should display stat block', function () {
      sut.execute(socket);

      expect(socket.emit).toHaveBeenCalled();
    });

  });

});
