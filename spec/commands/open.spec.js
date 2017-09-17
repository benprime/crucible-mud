'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/open');

describe('open', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should output message when direction is invalid', function() {
    });

    it('should output message when direction has no door', function() {
    });

    it('should output message when door is locked', function() {
    });

    it('should output message when door is opened', function() {
    });
  });
});