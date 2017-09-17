'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/help');

describe('help', function () {
  let socket;

  beforeAll(function() {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should display general help with no parameters', function() {
    });
    it('should display topic help with a parameter', function() {
    });
    it('should display error message when topic is invalid', function() {
    });
  });

});