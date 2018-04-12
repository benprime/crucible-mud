'use strict';

const sut = require('../combat');
const Room = require('../models/room');
const mocks = require('./mocks');

describe('combat command', function () {
  let mockRoom = mocks.getMockRoom();

  beforeAll(function(){
    global.io = new mocks.IOMock();
  });

  beforeEach(function(){
    spyOn(Room, 'getById').and.callFake(() => mockRoom);
  });

  describe('processPlayerCombatActions', function () {
    it('calls room.processPlayerCombatActions', function () {
      global.io.sockets.adapter.rooms = [1];
      sut.processPlayerCombatActions(new Date());

      expect(mockRoom.processPlayerCombatActions).toHaveBeenCalledWith(jasmine.any(Date));
    });

    it('should only call attack method on players that have an attack target', function () {
    });
  });

  describe('processMobCombatActions', function () {
    it('should only iterate over rooms that contain a mob', function () {
    });
  });
});