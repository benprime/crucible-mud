// 'use strict';

const Room = require('../models/room');
const Mob = require('../models/mob');
const sut = require('../core/combat');
const mocks = require('../../spec/mocks');

describe('combat command', () => {
  beforeAll(() => {
    global.io = new mocks.IOMock();
  });

  describe('processPlayerCombatActions', () => {
    let mockRoom;

    beforeEach(() => {
      mockRoom = mocks.getMockRoom();
      spyOn(Room, 'getById').and.callFake(() => mockRoom);
    });

    it('should call room.processPlayerCombatActions for all room Ids', () => {
      global.io.sockets.adapter.rooms = [1, 2];
      const now = Date.now();
      sut.processPlayerCombatActions(now);

      expect(mockRoom.processPlayerCombatActions).toHaveBeenCalledWith(now);
      expect(mockRoom.processPlayerCombatActions.calls.count()).toEqual(2);
    });

    it('should not call room.processPlayerCombatActions with no room ids', () => {
      global.io.sockets.adapter.rooms = [];

      const now = Date.now();
      sut.processPlayerCombatActions(now);

      expect(mockRoom.processPlayerCombatActions).not.toHaveBeenCalled();
    });
  });

  describe('processMobCombatActions', () => {
    it('should only iterate over rooms that contain a mob', () => {
      let roomWithMobs = mocks.getMockRoom();
      let firstMob = new Mob(mocks.mobType, roomWithMobs.id, 0);
      let secondMob = new Mob(mocks.mobType, roomWithMobs.id, 0);
      roomWithMobs.mobs.push(firstMob);
      roomWithMobs.mobs.push(secondMob);
      let roomWithoutMobs = mocks.getMockRoom();

      Room.roomCache[roomWithMobs.id] = roomWithMobs;
      Room.roomCache[roomWithoutMobs.id] = roomWithoutMobs;

      const now = Date.now();
      sut.processMobCombatActions(now);

      expect(roomWithMobs.processMobCombatActions).toHaveBeenCalledWith(now);
      expect(roomWithoutMobs.processMobCombatActions).not.toHaveBeenCalled();
    });

    describe('combatFrame', () => {
      it('should call processPlayerCombatActions and processMobCombatActions', () => {
        spyOn(sut, 'processPlayerCombatActions').and.callThrough();
        spyOn(sut, 'processMobCombatActions').and.callThrough();

        sut.combatFrame();

        expect(sut.processPlayerCombatActions).toHaveBeenCalledWith(jasmine.any(Number));
        expect(sut.processMobCombatActions).toHaveBeenCalledWith(jasmine.any(Number));
      });
    });
  });
});
