'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/teleport');

describe('teleport', function () {
  let socket;

  beforeAll(function () {    
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    
    it('should teleport to room if parameter is an ObjectId', function () {
    });

    it('should output messages when target is invalid user', function () {
    });

    it('should update user to target room id and save user object to database', function() {
    });

    it('should be an admin command', function() {
      expect(sut.admin).toBe(true);
    });

  });

});