'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const sut = require('../../commands/who');

describe('who', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
  });

  describe('execute', function () {
    it('should display online users', function() {
    });
  });

});