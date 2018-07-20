const socketUtil = require('../core/socketUtil');
const mocks = require('../../spec/mocks');

global.io = new mocks.IOMock();

const Mob = require('../models/mob');
const ObjectId = require('mongodb').ObjectId;
const mobData = require('../../data/mobData');

const sutModel = require('../models/room');

describe('room model', () => {

  beforeEach(() => {
    //socket = new mocks.SocketMock();
    global.io.reset();
  });

  describe('static method', () => {

    describe('getById', () => {
      it('should return correct room', () => {
        sutModel.roomCache['123'] = {
          name: 'a room',
        };

        const result = sutModel.getById('123');

        expect(result.name).toEqual('a room');
      });

      it('should return undefined when room not found', () => {
        sutModel.roomCache['123'] = {
          name: 'a room',
        };

        const result = sutModel.getById('222');

        expect(result).toBeUndefined();
      });
    });

    describe('oppositeDirection', () => {
      const oppositeDirectionParamTest = (inputDir, expectedOutput) => {
        it('should return correct direction', () => {
          const result = sutModel.oppositeDirection(inputDir);

          expect(result).toBe(expectedOutput);
        });
      };
      oppositeDirectionParamTest('n', 's');
      oppositeDirectionParamTest('ne', 'sw');
      oppositeDirectionParamTest('e', 'w');
      oppositeDirectionParamTest('se', 'nw');
      oppositeDirectionParamTest('s', 'n');
      oppositeDirectionParamTest('sw', 'ne');
      oppositeDirectionParamTest('w', 'e');
      oppositeDirectionParamTest('nw', 'se');
      oppositeDirectionParamTest('u', 'd');
      oppositeDirectionParamTest('d', 'u');
      oppositeDirectionParamTest('?', null);
    });


    describe('byCoords', () => {
      beforeEach(() => {
        spyOn(sutModel, 'findOne');
      });

      it('should call findOne with coordinates', () => {
        const coords = {
          x: 1,
          y: 2,
          z: 3,
        };

        sutModel.byCoords(coords);

        expect(sutModel.findOne).toHaveBeenCalledWith(coords, undefined);
      });
    });

    describe('shortToLong', () => {
      const shortToLongParamTest = (inputDir, expectedOutput) => {
        it('should return correct long direction name', () => {
          const result = sutModel.shortToLong(inputDir);

          expect(result).toBe(expectedOutput);
        });
      };
      shortToLongParamTest('n', 'north');
      shortToLongParamTest('ne', 'northeast');
      shortToLongParamTest('e', 'east');
      shortToLongParamTest('se', 'southeast');
      shortToLongParamTest('s', 'south');
      shortToLongParamTest('sw', 'southwest');
      shortToLongParamTest('w', 'west');
      shortToLongParamTest('nw', 'northwest');
      shortToLongParamTest('u', 'up');
      shortToLongParamTest('d', 'down');
      shortToLongParamTest('?', '?');
    });

    describe('longToShort', () => {
      const longToShortParamTest = (inputDir, expectedOutput) => {
        it('should return correct short direction name', () => {
          const result = sutModel.longToShort(inputDir);

          expect(result).toBe(expectedOutput);
        });
      };
      longToShortParamTest('north', 'n');
      longToShortParamTest('northeast', 'ne');
      longToShortParamTest('east', 'e');
      longToShortParamTest('southeast', 'se');
      longToShortParamTest('south', 's');
      longToShortParamTest('southwest', 'sw');
      longToShortParamTest('west', 'w');
      longToShortParamTest('northwest', 'nw');
      longToShortParamTest('up', 'u');
      longToShortParamTest('down', 'd');
      longToShortParamTest('?', '?');
    });

    describe('validDirectionInput', () => {
      const validDirParamTest = (inputDir, expectedOutput) => {
        it('should return correct response', () => {
          const result = sutModel.validDirectionInput(inputDir);

          expect(result).toBe(expectedOutput);
        });
      };
      validDirParamTest('north', 'n');
      validDirParamTest('n', 'n');
      validDirParamTest('northeast', 'ne');
      validDirParamTest('ne', 'ne');
      validDirParamTest('east', 'e');
      validDirParamTest('e', 'e');
      validDirParamTest('southeast', 'se');
      validDirParamTest('se', 'se');
      validDirParamTest('south', 's');
      validDirParamTest('s', 's');
      validDirParamTest('southwest', 'sw');
      validDirParamTest('sw', 'sw');
      validDirParamTest('west', 'w');
      validDirParamTest('w', 'w');
      validDirParamTest('northwest', 'nw');
      validDirParamTest('nw', 'nw');
      validDirParamTest('up', 'u');
      validDirParamTest('u', 'u');
      validDirParamTest('down', 'd');
      validDirParamTest('d', 'd');
      validDirParamTest('?', null);
    });
  });

  describe('instance method', () => {
    let room;
    beforeEach(() => {
      room = new sutModel({
        name: 'Test sutModel',
        desc: 'Test sutModel Description',
      });
      room.mobs = [];
      sutModel.prototype.save = jasmine.createSpy('room save spy').and.callFake((cb) => {
        if (cb) {
          cb(null, new sutModel({ id: '12345' }));
        }
      });
    });

    describe('usersInRoom', () => {
      let socket;
      beforeEach(() => {
        socket = new mocks.SocketMock();
        //global.io.reset();
      });

      it('should return empty array when no users in room', () => {
        global.io.sockets.adapter.rooms[room.id] = {};
        global.io.sockets.adapter.rooms[room.id].sockets = {};

        const result = room.usersInRoom(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      it('should return array of names when users in room', () => {
        const sockets = {};
        sockets[socket.id] = new mocks.SocketMock();
        sockets[socket.id].user.username = 'TestUser1';
        sockets['socket2'] = new mocks.SocketMock();
        sockets['socket2'].user.username = 'TestUser2';

        global.io.sockets.adapter.rooms[room.id] = {
          sockets,
        };
        global.io.sockets.connected = sockets;

        const result = room.usersInRoom(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result).toEqual(['TestUser1', 'TestUser2']);
      });
    });

    describe('createRoom', () => {
      let socket;
      let room;

      beforeAll(() => {
        socket = new mocks.SocketMock();
        global.io.reset();
      });

      beforeEach(() => {
        socket.reset();
        global.io.reset();
        room = new sutModel();
      });

      it('should return false if direction is invalid', () => {
        room.createRoom('invalid direction', (result) => {
          expect(result).toBe(false);
          expect(socket.emit).not.toHaveBeenCalled();
          expect(sutModel.prototype.save).not.toHaveBeenCalled();
        });
      });

      it('should return false if there is already an exit in a valid input direction', () => {
        room.exits.push({ dir: 'n', roomId: 'some-id' });
        room.createRoom('n', (result) => {
          expect(result).toBe(false);
          expect(socket.emit).not.toHaveBeenCalled();
          expect(sutModel.prototype.save).not.toHaveBeenCalled();
        });
      });

      it('should create a new room if room does not already exist in target direction', () => {
        // mock "findByCoords"
        spyOn(sutModel, 'findOne').and.callFake((coords, cb) => {
          cb(null);
        });

        room.createRoom('s', (result) => {
          var exit = room.exits.find(e => e.dir === 's');

          expect(exit).not.toBeUndefined();
          expect(result.id in sutModel.roomCache).toBe(true);
          expect(sutModel.prototype.save).toHaveBeenCalledTimes(2);
        });
      });

      it('should not load new room to cache when creating a door in a direction where room exists', () => {
        // mock "findByCoords"
        spyOn(sutModel, 'findOne').and.callFake((coords, cb) => {
          cb(new sutModel());
        });

        room.createRoom('s', (result) => {
          var exit = room.exits.find(e => e.dir === 's');

          expect(exit).not.toBeUndefined();
          expect(result.id in sutModel.roomCache).toBe(false);
          expect(sutModel.prototype.save).toHaveBeenCalledTimes(2);
        });
      });
    });

    describe('look', () => {

      let socket;

      beforeEach(() => {
        socket = new mocks.SocketMock();
      });

      it('should build output string with just title and exits when short parameter is passed', () => {
        room.look(socket, true);

        expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n' });
      });

      it('should build output string with description when short parameter is false', () => {
        room.look(socket, false);

        expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n' });
      });

      it('should include inventory in output when inventory length is not zero', () => {
        room.inventory = [{ displayName: 'An Item' }];
        room.look(socket);

        expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="darkcyan">You notice: An Item.</span>\n' });
      });

      it('should include users in room when the user is not the only user in room', () => {
        const sockets = {};
        sockets[socket.id] = new mocks.SocketMock();
        sockets[socket.id].user.username = 'TestUser1';
        sockets['socket2'] = new mocks.SocketMock();
        sockets['socket2'].user.username = 'TestUser2';

        global.io.sockets.adapter.rooms[room.id] = {
          sockets,
        };
        global.io.sockets.connected = sockets;

        room.look(socket);

        expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="purple">Also here: <span class="teal">TestUser1<span class="mediumOrchid">, </span>TestUser2</span>.</span>\n' });
      });

      it('should include exits when there is at least one exit in the room', () => {
        room.exits = [{ dir: 'n' }];
        room.look(socket);

        expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="green">Exits: north</span>\n' });
      });

      it('should display room id when user is an admin', () => {
        socket.user.admin = true;
        room.look(socket);

        expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="gray">Room ID: ' + room.id + '</span>\n' });
      });
    });

    describe('getMobById', () => {
      it('should return mob by in the room', () => {
        let mob = Object.create(Mob.prototype);
        mob.displayName = 'Test Mob';
        room.mobs = [mob];

        let result = room.getMobById(mob.id);

        expect(result).toBe(mob);
      });

      it('should return falsy when mob not found', () => {
        let mob = Object.create(Mob.prototype);
        mob.displayName = 'Test Mob';

        let result = room.getMobById(mob.id);

        expect(result).toBeFalsy();
      });
    });

    describe('dirToCoords', () => {
      const dirToCoordsParamTest = (inputDir, expectedOutput) => {
        it('should return correct direction', () => {
          const result = sutModel.oppositeDirection(inputDir);

          expect(result).toBe(expectedOutput);
        });
      };
      dirToCoordsParamTest('n', 's');
      dirToCoordsParamTest('ne', 'sw');
      dirToCoordsParamTest('e', 'w');
      dirToCoordsParamTest('se', 'nw');
      dirToCoordsParamTest('s', 'n');
      dirToCoordsParamTest('sw', 'ne');
      dirToCoordsParamTest('w', 'e');
      dirToCoordsParamTest('nw', 'se');
      dirToCoordsParamTest('u', 'd');
      dirToCoordsParamTest('d', 'u');
      dirToCoordsParamTest('?', null);
    });

    describe('getExit', () => {
      it('should return undefined if exit does not exists', () => {
        let result = room.getExit('s');

        expect(result).toBeUndefined();
      });

      it('should return exit object when exit exists', () => {
        let exit = { _id: new ObjectId(), dir: 'n', roomId: new ObjectId() };
        room.exits.push(exit);

        let result = room.getExit('n');

        expect(result.dir).toEqual(exit.dir);
        expect(result.roomId.toString()).toEqual(exit.roomId.toString());
      });

    });

    describe('addExit', () => {
      it('should return false if exit already exists', () => {
        let exit = { _id: new ObjectId(), dir: 's', roomId: new ObjectId() };
        room.exits.push(exit);

        let result = room.addExit('s');

        expect(result).toBeFalsy();
      });

      it('should return true when exit successfully added to object', () => {
        let result = room.addExit('e');

        let exit = room.exits.find(e => e.dir === 'e');

        expect(result).toBeTruthy();
        expect(exit).toBeDefined();
      });
    });

    describe('processPlayerCombatActions', () => {
      it('should iterate over players in room with attackTarget', () => {
        // arrange
        const socketA = new mocks.SocketMock();
        socketA.user.attackTarget = {};
        const socketB = new mocks.SocketMock();
        socketB.user.attackTarget = {};
        const socketC = new mocks.SocketMock();
        socketC.user.attackTarget = {};
        spyOn(socketUtil, 'getRoomSockets').and.callFake(() => [socketA, socketB, socketC]);
        spyOn(room, 'getMobById').and.returnValue({});

        // act
        room.processPlayerCombatActions(new Date());

        // assert
        expect(socketA.user.attack).toHaveBeenCalled();
        expect(socketB.user.attack).toHaveBeenCalled();
        expect(socketC.user.attack).toHaveBeenCalled();
      });

      it('should not call attack when player attack target is null', () => {
        // arrange
        const socketA = new mocks.SocketMock();
        socketA.user.attackTarget = {};
        const socketB = new mocks.SocketMock();
        socketB.user.attackTarget = null;
        const socketC = new mocks.SocketMock();
        socketC.user.attackTarget = {};
        spyOn(socketUtil, 'getRoomSockets').and.callFake(() => [socketA, socketB, socketC]);
        spyOn(room, 'getMobById').and.returnValue({});

        // act
        room.processPlayerCombatActions(new Date());

        // assert
        expect(socketA.user.attack).toHaveBeenCalled();
        expect(socketB.user.attack).not.toHaveBeenCalled();
        expect(socketC.user.attack).toHaveBeenCalled();
      });
    });

    describe('processMobCombatActions', () => {
      beforeEach(() => {
        global.io.reset();
      });

      it('should call attack and taunt on all mobs', () => {
        // arrange
        const mobType = mobData.catalog[0];
        room.mobs = [];

        const mobA = new Mob(mobType, room.id);
        mobA.attack = jasmine.createSpy('mobAattack');
        mobA.taunt = jasmine.createSpy('mobAtaunt');
        room.mobs.push(mobA);

        const mobB = new Mob(mobType, room.id);
        mobB.attack = jasmine.createSpy('mobBattack');
        mobB.taunt = jasmine.createSpy('mobBtaunt');
        room.mobs.push(mobB);

        const mobC = new Mob(mobType, room.id);
        mobC.attack = jasmine.createSpy('mobCattack');
        mobC.taunt = jasmine.createSpy('mobCtaunt');
        room.mobs.push(mobC);

        // act
        room.processMobCombatActions();

        // assert
        expect(room.mobs[0].attack).toHaveBeenCalled();
        expect(room.mobs[0].taunt).toHaveBeenCalled();
        expect(room.mobs[1].attack).toHaveBeenCalled();
        expect(room.mobs[1].taunt).toHaveBeenCalled();
        expect(room.mobs[2].attack).toHaveBeenCalled();
        expect(room.mobs[2].taunt).toHaveBeenCalled();
      });
    });
  });
});
