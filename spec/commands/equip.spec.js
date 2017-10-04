'use strict';

const Room = require('../../models/room');
const mocks = require('../mocks');
const sut = require('../../commands/equip');

describe('equip', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(Room, 'getRoomById').and.callFake(() => room);
  });

  describe('execute', function () {
    it('should output message when item is not in inventory', function() {
    });

    it('should output message when item is not equipable', function() {
    });

    // good candidate for that test case custom runner 
    it('should equip item of equip type', function() {
      // test case for each type
    });

  });

});