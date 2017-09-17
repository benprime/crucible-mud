'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/exp');

describe('exp', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
  });

  describe('execute', function () {
    it('should display the current experience level, xp, and next level', function() {
    });
  });

});