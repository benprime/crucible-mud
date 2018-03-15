'use strict';

const Room = require('../../models/room');
const mocks = require('../mocks');
const mobData = require('../../data/mobData');


describe('mob model', function () {
  let mobType;
  let mob;
  let room;
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    room = new mocks.getMockRoom();
    mobType = mobData.catalog[0];
    const Mob = require('../../models/mob');
    mob = new Mob(mobType, room.roomId);
    spyOn(Room, 'getById').and.callFake(() => room);
    spyOn(mob, 'die').and.callThrough();
  });

  describe('constructor', function() {
    it('should initialize properties', function() {
      expect(mob.hp).not.toBeNull();
      expect(mob.xp).not.toBeNull();
      expect(mob.minDamage).not.toBeNull();
      expect(mob.maxDamage).not.toBeNull();
      expect(mob.hitDice).not.toBeNull();
      expect(mob.attackInterval).not.toBeNull();
      expect(mob.roomId).not.toBeNull();
      expect(mob.displayName).not.toBeNull();
    });
  });

  describe('look', function() {
    it('should output mob description', function() {
      // arrange
      socket.user.admin = false;

      // act
      mob.look(socket);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: mob.desc });
      expect(socket.emit).not.toHaveBeenCalledWith('output', { message: `Mob ID: ${mob.id}` });
    });

    it('should output mob id if logged in user is admin', function() {
      // arrange
      socket.user.admin = true;

      // act
      mob.look(socket);

      // assert
      expect(socket.emit).toHaveBeenCalledWith('output', { message: mob.desc });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `Mob ID: ${mob.id}` });
    });
  });

  describe('takeDamage', function() {
    it('should reduce the hp by the damage amount', function() {
      // arrange
      mob.hp = 10;

      // act
      mob.takeDamage(socket, 2);

      // assert
      expect(mob.hp).toBe(8);
      expect(mob.die).not.toHaveBeenCalled();
    });

    it('should call the die method if hp is reduced to zero', function() {
      // arrange
      mob.hp = 2;

      // act
      mob.takeDamage(socket, 2);

      // assert
      expect(mob.hp).toBe(0);
      expect(mob.die).toHaveBeenCalled();
    });
  });

  describe('die', function() {
    it('should update room.lastMobDeath', function() {

    });

    it('should output mob death message', function() {

    });

    it('should remove mob from room', function() {

    });
  });

  describe('awardExperience', function() {
    it('should award experience to each player currently attacking mob', function() {

    });

    it('should output to each player attacking mob that combat is disengaged', function() {

    });
  });

  describe('selectTarget', function() {
    it('if player is in room, mob should move to attack', function() {

    });

    it('if no player is in room, mob should do nothing', function() {

    });
  });

  describe('attackRoll', function() {
    // TODO: Fill this in when logic is added
  });

  describe('attack', function() {
    it('should return false when mob has no attack target', function() {
    });

    it('should set attackTarget to undefined if target socket is not in room', function() {
    });

    it('should update lastAttack on every attack', function() {
    });

    it('should return false if player socket not found', function() {
    });

    it('should output hit messages if attack roll successful', function() {
    });

    it('should output miss messages if attack roll fails', function() {
    });

    it('should return true if mob has attacked', function() {
    });
  });

  describe('taunt', function() {
    it('should', function() {
    });
  });

  describe('readyToAttack', function() {
    it('should return true when no last attack', function() {

    });

    it('should return false when last attack + attack inteval is less than now', function() {

    });

    it('should return true when last attack + attack inteval is greater than now', function() {

    });
  });

  describe('readyToTaunt', function() {
    it('should return true when no last taunt', function() {

    });

    it('should return false when last taunt + taunt inteval is less than now', function() {

    });

    it('should return true when last taunt + taunt inteval is greater than now', function() {

    });
  });

  describe('readyToIdle', function() {
    it('should return true when no last idle', function() {

    });

    it('should return false when last idle + idle inteval is less than now', function() {

    });

    it('should return true when last idle + idle inteval is greater than now', function() {

    });
  });
});
