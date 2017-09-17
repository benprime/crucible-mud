'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const sut = require('../../commands/close');

describe('close', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(roomManager, 'getRoomById').and.callFake(() => room);
});

  describe('execute', function () {

    it('should print message on invalid direction', function() {
    });

    it('should print message when no door exists in valid direction', function() {
    });
          
    it('should be succesful when door is open', function() {
    });

    it('should be succesful when door already closed', function() {
    });

  });

});