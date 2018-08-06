import { mockGetById } from '../models/room';
import { mockSocketInRoom, mockRoomMessage, mockGetRoomSockets } from '../core/socketUtil';
import { mockRoll, mockGetRandomNumber } from '../core/dice';
import mocks from '../../spec/mocks';
import sutModel from '../models/mob';
import config from '../config';
import mobData from '../data/mobData';

jest.mock('../models/room');
jest.mock('../core/socketUtil');
jest.mock('../core/dice');

global.io = new mocks.IOMock();
let socket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();


describe('mob model', () => {
  let mobType;
  let mob;

  beforeEach(() => {
    socket.reset();
    mockRoom.id = socket.user.roomId;
    mockRoom.reset();
    mockGetById.mockReturnValue(mockRoom);
    global.io.reset();

    mobType = mobData.catalog[0];

    mob = new sutModel(mobType, mockRoom.roomId, 0);
    mob.die = jest.fn().mockName('mobDie');

    mockGetRoomSockets.mockReturnValue([socket]);
  });

  describe('constructor', () => {

    test('should initialize properties', () => {
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

  describe('look', () => {

    test('should output mob description', () => {
      // arrange
      socket.user.admin = false;

      // act
      mob.look(socket);

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: mob.desc });
      expect(socket.emit).not.toBeCalledWith('output', { message: `Mob ID: ${mob.id}` });
    });

    test('should output mob id if logged in user is admin', () => {
      // arrange
      socket.user.admin = true;

      // act
      mob.look(socket);

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: mob.desc });
      expect(socket.emit).toBeCalledWith('output', { message: `Mob ID: ${mob.id}` });
    });
  });

  describe('takeDamage', () => {

    test('should reduce the hp by the damage amount', () => {
      // arrange
      mob.hp = 10;

      // act
      mob.takeDamage(socket, 2);

      // assert
      expect(mob.hp).toBe(8);
      expect(mob.die).not.toHaveBeenCalled();
    });

    test('should call the die method if hp is reduced to zero', () => {
      // arrange
      mockGetRoomSockets.mockReturnValueOnce([]);
      mob.hp = 2;

      // act
      mob.takeDamage(socket, 2);

      // assert
      expect(mob.hp).toBe(0);
      expect(mob.die).toHaveBeenCalled();
    });
  });

  describe('die', () => {

    beforeEach(() => {
      mob = new sutModel(mobType, mockRoom.roomId, 0);
      mockRoom.mobs = [mob];
    });

    test('should update room.spawnTimer', () => {
      // arrange
      mockRoom.spawnTimer = null;

      // act
      mob.die(socket);

      // assert
      expect(mockRoom.spawnTimer).not.toBeNull();
    });

    test('should output mob death message', () => {
      // act
      mob.die(socket);

      // assert
      expect(global.io.to(mockRoom.id).emit).toBeCalledWith('output', { message: `The ${mob.displayName} collapses.` });
    });

    test('should remove mob from room', () => {
      // act
      mob.die(socket);

      // assert
      expect(mockRoom.mobs).not.toContain(mob);
    });
  });

  describe('awardExperience', () => {

    beforeEach(() => {
      mob = new sutModel(mobType, mockRoom.roomId, 0);
      socket.user.attackTarget = mob.id;
    });

    test('should award experience to each player currently attacking mob', () => {
      // arrange
      socket.attackTarget = mob.id;

      // act
      mob.die(socket);

      // assert
      expect(socket.user.addExp).toBeCalledWith(mob.xp);
      expect(socket.emit).toBeCalledWith('output', { message: `You gain ${mob.xp} experience.` });
      expect(socket.emit).toBeCalledWith('output', { message: '<span class="olive">*** Combat Disengaged ***</span>' });
    });
  });

  describe('selectTarget', () => {

    describe('when player is in room', () => {

      beforeEach(() => {
        socket = new mocks.SocketMock();
        mockGetRandomNumber.mockReturnValueOnce(0);
        const sockets = {};
        sockets[socket.id] = socket;
        global.io.sockets.adapter.rooms[mockRoom.id] = {
          sockets,
        };
        global.io.sockets.connected[socket.id] = socket;
      });

      test('and mob attack target is null, mob should move to attack', () => {
        mob.attackTarget = null;
        mob.selectTarget(mockRoom.id);

        expect(socket.to(mockRoom.id).emit).toBeCalledWith('output', { message: `The ${mob.displayName} moves to attack ${socket.user.username}!` });
        expect(socket.emit).toBeCalledWith('output', { message: `The ${mob.displayName} moves to attack you!` });
      });

      test('and mob attack target is populated, select target should do nothing', () => {
        mob.attackTarget = {};
        mob.selectTarget(mockRoom.id);

        expect(socket.to(mockRoom.id).emit).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
      });
    });

    describe('when no players are in room', () => {

      beforeEach(() => {
        global.io.sockets.adapter.rooms[mockRoom.id] = {
          sockets: {},
        };
      });

      test('if no player is in room, mob should do nothing', () => {
        mob.attackTarget = null;
        mob.selectTarget(mockRoom.id);

        expect(socket.to(mockRoom.id).emit).not.toHaveBeenCalled();
        expect(socket.emit).not.toHaveBeenCalled();
      });
    });

  });

  describe('attackroll', () => {
    // TODO: Fill this in when logic is added
  });

  describe('attack', () => {

    beforeEach(() => {
      global.io.sockets.connected[socket.id] = socket;
    });

    test('should return false when mob has no attack target', () => {
      // arrange
      mob.attackTarget = null;

      // act
      mob.attack(new Date());

      // assert
      expect(socket.emit).not.toHaveBeenCalled();
      expect(mockRoomMessage).not.toHaveBeenCalled();
    });

    test('should set attackTarget to null if target socket is not in room', () => {
      // arrange
      mob.attackTarget = 'non existant socket';
      mockSocketInRoom.mockReturnValueOnce(false);

      // act
      const result = mob.attack(new Date());

      // assert
      expect(mob.attackTarget).toBeNull();
      expect(socket.emit).not.toHaveBeenCalled();
      expect(mockRoomMessage).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should update lastAttack and return true on every successful attack', () => {
      // arrange
      mockSocketInRoom.mockReturnValueOnce(true);
      mob.attackTarget = socket.id;
      mockRoll.mockReturnValueOnce(0);

      // act
      const result = mob.attack(new Date());

      // assert
      expect(mob.attackTarget).toBe(socket.id);
      expect(socket.emit).toHaveBeenCalled();
      expect(mockRoomMessage).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('should output hit messages if attack roll successful', () => {
      // arrange
      mockSocketInRoom.mockReturnValueOnce(true);
      mockRoll.mockReturnValueOnce(1);
      mob.attackTarget = socket.id;
      const playerMessage = `<span class="${config.DMG_COLOR}">The ${mob.displayName} hits you for 0 damage!</span>`;
      const roomMessage = `<span class="${config.DMG_COLOR}">The ${mob.displayName} hits ${socket.user.username} for 0 damage!</span>`;

      // act
      mob.attack(new Date());

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: playerMessage });
      expect(mockRoomMessage).toBeCalledWith(socket.user.roomId, roomMessage, [socket.id]);
    });

    test('should output miss messages if attack roll fails', () => {
      // arrange
      mockSocketInRoom.mockReturnValueOnce(true);

      mockRoll.mockReturnValueOnce(0);
      mob.attackTarget = socket.id;
      const playerMessage = `<span class="${config.MSG_COLOR}">The ${mob.displayName} swings at you, but misses!</span>`;
      const roomMessage = `<span class="${config.MSG_COLOR}">The ${mob.displayName} swings at ${socket.user.username}, but misses!</span>`;

      // act
      mob.attack(new Date());

      // assert
      expect(socket.emit).toBeCalledWith('output', { message: playerMessage });
      expect(mockRoomMessage).toBeCalledWith(socket.user.roomId, roomMessage, [socket.id]);
    });
  });

  describe('taunt', () => {

    test('should return if no attack target', () => {
      // arrange
      mob.attackTarget = null;

      // act
      mob.taunt(new Date());

      // assert
      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
    });

    test('should return if user has left room', () => {
      // arrange
      mob.attackTarget = 'ANOTHER SOCKET ID';

      // act
      mob.taunt(new Date());

      // assert
      expect(socket.emit).not.toHaveBeenCalled();
      expect(socket.broadcast.to(socket.user.roomId).emit).not.toHaveBeenCalled();
    });

    test('should send an individual message and a room message', () => {
      // arrange
      mockGetRandomNumber.mockReturnValueOnce(0);
      mockSocketInRoom.mockReturnValueOnce(true);

      global.io.sockets.connected[socket.id] = socket;
      mob.attackTarget = socket.id;

      // act
      mob.taunt(new Date());

      // assert
      expect(socket.emit).toHaveBeenCalled();
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalled();
    });
  });

  describe('readyToAttack', () => {

    test('should return false if no attackInterval is set', () => {
      // arrange
      mob.attackInterval = null;

      // act
      const result = mob.readyToAttack(Date.now());

      // assert
      expect(result).toBe(false);
    });

    test('should return true when no last attack', () => {
      // arrange
      mob.attackInterval = 2000;
      mob.lastAttack = null;

      // act
      const result = mob.readyToAttack(Date.now());

      // assert
      expect(result).toBe(true);
    });

    test('should return false when last attack + attack inteval is less than now', () => {
      // arrange
      mob.lastAttack = Date.now();
      mob.attackInterval = 3000;

      // act
      const result = mob.readyToAttack(Date.now());

      // assert
      expect(result).toBe(false);
    });

    test('should return true when last attack + attack inteval is less than or equal to now', () => {
      // arrange
      mob.lastAttack = Date.now();
      mob.attackInterval = -3000;

      // act
      const result = mob.readyToAttack(Date.now());

      // assert
      expect(result).toBe(true);
    });
  });

  describe('readyToTaunt', () => {

    test('should return false if no tauntInterval is set', () => {
      // arrange
      mob.tauntInterval = null;

      // act
      const result = mob.readyToTaunt(Date.now());

      // assert
      expect(result).toBe(false);
    });

    test('should return true when no last taunt', () => {
      // arrange
      mob.attackTarget = {};
      mob.lastTaunt = null;

      // act
      const result = mob.readyToTaunt(Date.now());

      // assert
      expect(result).toBe(true);
    });

    test('should return false when last taunt + taunt inteval is less than now', () => {
      // arrange
      mob.attackTarget = {};
      mob.lastTaunt = Date.now();
      mob.tauntInterval = -3000;

      // act
      const result = mob.readyToTaunt(Date.now());

      // assert
      expect(result).toBe(true);
    });

    test('should return true when last taunt + taunt inteval less than or equal to now', () => {
      // arrange
      mob.attackTarget = {};
      mob.lastTaunt = Date.now();
      mob.tauntInterval = -3000;

      // act
      const result = mob.readyToTaunt(Date.now());

      // assert
      expect(result).toBe(true);
    });
  });

  describe('readyToIdle', () => {

    test('should return false when no idleInterval is set', () => {
      // arrange
      mob.idleInterval = null;

      // act
      const result = mob.readyToIdle(Date.now());

      // assert
      expect(result).toBe(false);
    });

    test('should return true when no last idle', () => {
      // arrange
      mob.idleInterval = 2000;
      mob.lastIdle = null;

      // act
      const result = mob.readyToIdle(Date.now());

      // assert
      expect(result).toBe(true);
    });

    test('should return true when last idle + idle inteval is less than now', () => {
      // arrange
      mob.idleInterval = -2000;
      mob.lastIdle = Date.now();

      // act
      const result = mob.readyToIdle(Date.now());

      // assert
      expect(result).toBe(true);
    });

    test('should return false when last idle + idle inteval is greater than now', () => {
      // arrange
      mob.idleInterval = 2000;
      mob.lastIdle = Date.now();

      // act
      const result = mob.readyToIdle(Date.now());

      // assert
      expect(result).toBe(false);
    });
  });
});
