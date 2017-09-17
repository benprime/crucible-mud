'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/lock');

describe('lock', function () {
  let socket;

  beforeAll(function() {
    socket = new mocks.SocketMock();
  });

  it('should output message when direction is invalid', function() {
  });

  it('should output message when direction is not a door', function() {
  });

  it('should output message when key name is invalid', function() {
  });

  it('should output message when multiple keys match key name', function() {
  });

  it('should create door if direction does not currently have a door', function() {
  });

  it('should lock existing door', function() {
  });

  it('should output message on sucess', function() {
  });

  it('should update room state with door and save new locked door to database', function() {
  });

  it('should be an admin command', function() {
    expect(sut.admin).toBe(true);
  });

});