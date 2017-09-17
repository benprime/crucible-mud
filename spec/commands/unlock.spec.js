'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/unlock');

describe('unlock', function () {
  let socket;

  beforeAll(function() {
    socket = new mocks.SocketMock();
  });

  it('should output message when direction is invalid', function() {
  });

  it('should output message when a door exists but is not locked', function() {
  });

  it('should output message when user is not carrying the key', function() {
  });

  it('should output message when key name is ambiguous', function() {
  });

  it('should output message when key is the wrong key for the door', function() {
  });

  it('should unlock door with output message when command successful', function() {
  });

  it('should automatically relock door after timeout', function() {
    // todo: make timeout a parameter and try 0
  });
});