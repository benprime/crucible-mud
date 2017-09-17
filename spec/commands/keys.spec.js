'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/keys');

describe('keys', function () {
  let socket;

  beforeAll(function() {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should display user keys', function() {
    });
  });

});