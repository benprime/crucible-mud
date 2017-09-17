'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/summon');

describe('summon', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should output message when user is not found', function() {
    });
    it('should join target user to admin room and leave current room', function() {
    });
    it('should should update target user room id and save user to database', function() {
    });
    it('shoudl output messages when command successful', function() {
    });
    it('should be an admin command', function() {
      expect(sut.admin).toBe(true);
    });
  });
});