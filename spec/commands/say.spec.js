'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/say');

describe('say', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should output messages to room', function() {
    });

    it('should escape tags for display', function() {
    });

  });
});