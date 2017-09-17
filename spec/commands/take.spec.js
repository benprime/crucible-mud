'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/take');

describe('take', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should output message when item is not found', function() {
    });
    it('should output message when item is fixed', function() {
    });
    it('should update the room/user and save room/user to database', function() {
    });
    it('should output message when command successful', function() {
    });
  });
});