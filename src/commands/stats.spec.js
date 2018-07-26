'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./inventory', {});

describe('stats', function () {

  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => socket.emit.calls.reset());

  describe('execute', function () {

    it('should display stat block', function () {
      sut.execute(socket);

      //some really long output to check
      expect(socket.emit.calls.mostRecent().args[0]).toBe('output');
      //expect(socket.emit.calls.mostRecent().args[1].message.includes(expectedString)).toBeTruthy(`message: ${socket.emit.calls.mostRecent().args[1].message} did not contain: ${expectedString}`);
    });

  });

});
