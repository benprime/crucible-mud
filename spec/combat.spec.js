// 'use strict';

const Room = require('../models/room');
const Mob = require('../models/mob');
const sut = require('../combat');
const mocks = require('./mocks');

describe('combat command', function () {
  beforeAll(function(){
    global.io = new mocks.IOMock();
  });

  describe('processPlayerCombatActions', function () {
    let mockRoom;

    beforeEach(function(){
      mockRoom = mocks.getMockRoom();
      spyOn(Room, 'getById').and.callFake(() => mockRoom);
    });

    it('should call room.processPlayerCombatActions for all room Ids', function () {
      global.io.sockets.adapter.rooms = [1, 2];
      var now = Date.now();
      sut.processPlayerCombatActions(now);

      expect(mockRoom.processPlayerCombatActions).toHaveBeenCalledWith(now);
      expect(mockRoom.processPlayerCombatActions.calls.count()).toEqual(2);
    });

    it('should not call room.processPlayerCombatActions with no room ids', function () {
      global.io.sockets.adapter.rooms = [];

      var now = Date.now();
      sut.processPlayerCombatActions(now);

      expect(mockRoom.processPlayerCombatActions).not.toHaveBeenCalled();
    });
  });

  describe('processMobCombatActions', function () {
    it('should only iterate over rooms that contain a mob', function () {
      let roomWithMobs = mocks.getMockRoom();
      let firstMob = new Mob(mocks.mobType, roomWithMobs.id, 0);
      let secondMob = new Mob(mocks.mobType, roomWithMobs.id, 0);
      roomWithMobs.mobs.push(firstMob);
      roomWithMobs.mobs.push(secondMob);
      let roomWithoutMobs = mocks.getMockRoom();
     
      Room.roomCache[roomWithMobs.id] = roomWithMobs;
      Room.roomCache[roomWithoutMobs.id] = roomWithoutMobs;

      var now = Date.now();
      sut.processMobCombatActions(now);

      expect(roomWithMobs.processMobCombatActions).toHaveBeenCalledWith(now);
      expect(roomWithoutMobs.processMobCombatActions).not.toHaveBeenCalled();
    });

    describe('combatFrame', function(){
      it('should call processPlayerCombatActions and processMobCombatActions', function(){
        spyOn(sut, 'processPlayerCombatActions').and.callThrough();
        spyOn(sut, 'processMobCombatActions').and.callThrough();

        sut.combatFrame();

        expect(sut.processPlayerCombatActions).toHaveBeenCalledWith(jasmine.any(Number));
        expect(sut.processMobCombatActions).toHaveBeenCalledWith(jasmine.any(Number));
      });
    });
  });
});