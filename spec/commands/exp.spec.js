'use strict';

const mocks = require('../mocks');
const User = require('../../models/user');
const sut = require('../../commands/exp');

describe('exp', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    socket.user = new User();
    room = mocks.getMockRoom();
  });

  describe('execute', function () {
    it('should display the current experience level, xp, and next level', function() {
      sut.execute(socket);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class=\'cyan\'>XP: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Level: </span><span class=\'silver\'>undefined</span>\n<span class=\'cyan\'>Next: </span><span class=\'silver\'>NaN</span>\n' });
    });
  });

});