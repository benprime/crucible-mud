'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./help', {});

describe('help', function () {
  let socket;
  let command;

  beforeAll(function () {
    socket = new mocks.SocketMock();

    command = {
      name: 'gossip',
      help: jasmine.createSpy('gossip'),
    };

    sut.registerCommand(command);
  });

  describe('execute', function () {

    it('should display general help with no parameters', function () {
      sut.execute(socket);

      //TODO: Preload entire help message into a variable or whatnot to check for accuracy
      expect(socket.emit).toHaveBeenCalled();
    });

    it('should display topic help with a parameter', function () {
      sut.execute(socket, 'gossip');

      //check accuracy of output for gossip
      expect(command.help).toHaveBeenCalled();
    });

    it('should display error message when topic is invalid', function () {
      sut.execute(socket, 'yourface');

      //check output for bad command
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'No help for that topic.' });
    });
  });

});
