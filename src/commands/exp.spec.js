'use strict';

const mocks = require('../../spec/mocks');
const User = require('../models/user');
const SandboxedModule = require('sandboxed-module');

const sut = SandboxedModule.require('./exp', {});

describe('exp', () => {
  let socket;

  beforeAll(() => {
    socket = new mocks.SocketMock();
    socket.user = new User();
  });

  describe('execute', () => {
    it('should display the current experience level, xp, and next level', () => {
      sut.execute(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class=\'cyan\'>XP: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Level: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Next: </span><span class=\'silver\'>NaN</span>\n' });
    });
  });

});
