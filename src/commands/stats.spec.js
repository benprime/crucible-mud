'use strict';

import mocks from '../../spec/mocks';
import sut from './stats';

describe('stats', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.mockClear());

  describe('execute', function () {

    //TODO: This test needs some updating
    xtest('should display stat block', function () {
      sut.execute(socket);

      //some really long output to check
      const expectedString = '';
      expect(socket.emit).toHaveBeenCalledWith('output', {message: expectedString});
    });

  });

});
