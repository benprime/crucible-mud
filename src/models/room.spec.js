import { mockGetRoomSockets, mockGetSocketByCharacterId } from '../core/socketUtil';
import Mob from '../models/mob';
import mobData from '../data/mobData';
import sutModel from '../models/room';
import mocks from '../../spec/mocks';
import { Types } from 'mongoose';
const { ObjectId } = Types;

jest.mock('../core/socketUtil');

// mocking mongoose provided model methods
sutModel.save = jest.fn(() => Promise.resolve({}));
sutModel.constructor = jest.fn(() => Promise.resolve({
  save: jest.fn(() => Promise.resolve({})),
}));


global.io = new mocks.IOMock();

describe('room model', () => {

  beforeEach(() => {
    global.io.reset();
  });

  describe('static method', () => {

    describe('getById', () => {
      test('should return correct room', () => {
        sutModel.roomCache['123'] = {
          name: 'a room',
        };

        const result = sutModel.getById('123');

        expect(result.name).toEqual('a room');
      });

      test('should return undefined when room not found', () => {
        sutModel.roomCache['123'] = {
          name: 'a room',
        };

        const result = sutModel.getById('222');

        expect(result).toBeUndefined();
      });
    });

    describe('oppositeDirection', () => {
      const oppositeDirectionParamTest = (inputDir, expectedOutput) => {
        test('should return correct direction', () => {
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

      test('should call findOne with coordinates', () => {
        const coords = {
          x: 1,
          y: 2,
          z: 3,
        };

        sutModel.findOne = jest.fn().mockReturnValueOnce(Promise.resolve({}));

        sutModel.byCoords(coords).then(() => {
          expect(sutModel.findOne).toBeCalledWith(coords);
        });

      });
    });

    describe('shortToLong', () => {
      const shortToLongParamTest = (inputDir, expectedOutput) => {
        test('should return correct long direction name', () => {
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
        test('should return correct short direction name', () => {
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
        test('should return correct response', () => {
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
    });

    describe('charactersInRoom', () => {
      let socket;
      beforeEach(() => {
        socket = new mocks.SocketMock();
      });

      test('should return empty array when no users in room', () => {
        global.io.sockets.adapter.rooms[room.id] = {};
        global.io.sockets.adapter.rooms[room.id].sockets = {};

        const result = room.charactersInRoom(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      });

      test('should return array of names when users in room', () => {
        const sockets = {};
        sockets[socket.id] = new mocks.SocketMock();
        sockets[socket.id].character.name = 'TestUser1';
        sockets['socket2'] = new mocks.SocketMock();
        sockets['socket2'].character.name = 'TestUser2';

        global.io.sockets.adapter.rooms[room.id] = {
          sockets,
        };
        global.io.sockets.connected = sockets;

        const result = room.charactersInRoom(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);
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

      test('should return false if direction is invalid', () => {
        return room.createRoom('invalid direction').catch(response => {
          expect(response).toBe('Invalid direction');
        });
      });

      test('should return false if there is already an exit in a valid input direction', () => {
        room.exits.push({ dir: 'n', roomId: 'some-id' });
        return room.createRoom('n').catch(response => {
          expect(response).toBe('Exit already exists');
        });
      });


      describe('successful creation', () => {

        beforeEach(() => {
          room.save = jest.fn(() => Promise.resolve(room));
          const resultRoom = mocks.getMockRoom();
          resultRoom.save = jest.fn(() => Promise.resolve(resultRoom));
          sutModel.create = jest.fn().mockReturnValue(resultRoom);
        });
        afterEach(() => {
          sutModel.create.mockRestore();
        });

        test('should create a new room if room does not already exist in target direction', () => {

          return room.createRoom('s').then(room => {
            const exit = room.exits.find(({ dir }) => dir === 's');

            expect(exit).not.toBeUndefined();
            expect(exit.roomId in sutModel.roomCache).toBe(true);
          });
        });

        test('should not load new room to cache when creating a door in a direction where room exists', () => {
          return room.createRoom('s').then(updateRoom => {
            const exit = updateRoom.exits.find(({ dir }) => dir === 's');

            expect(exit).not.toBeUndefined();
            expect(updateRoom.id in sutModel.roomCache).toBe(false);
          });
        });

      });
    });

    describe('look', () => {

      let socket;

      beforeEach(() => {
        socket = new mocks.SocketMock();
        mockGetSocketByCharacterId.mockReturnValue(socket);
      });

      test('should build output string with just title and exits when short parameter is passed', () => {
        return room.look(socket, true).then(output => {
          expect(output).toEqual('<span class="cyan">Test sutModel</span>\n');
        });

      });

      test('should build output string with description when short parameter is false', () => {
        return room.look(socket, false).then(output => {
          expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n');
        });
      });

      test('should include inventory in output when inventory length is not zero', () => {
        room.inventory = [{ displayName: 'An Item' }];
        return room.look(socket).then(output => {
          expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="darkcyan">You notice: An Item.</span>\n');
        });

      });

      test('should include users in room when the user is not the only user in room', () => {
        const sockets = {};
        sockets[socket.id] = new mocks.SocketMock();
        sockets[socket.id].character.name = 'TestUser1';
        sockets['socket2'] = new mocks.SocketMock();
        sockets['socket2'].character.name = 'TestUser2';

        global.io.sockets.adapter.rooms[room.id] = {
          sockets,
        };
        global.io.sockets.connected = sockets;

        return room.look(socket).then(output => {
          expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="purple">Also here: <span class="teal">TestUser1<span class="mediumOrchid">, </span>TestUser2</span>.</span>\n');
        });
      });

      test('should include exits when there is at least one exit in the room', () => {
        room.exits = [{ dir: 'n' }];
        return room.look(socket).then(output => {
          expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="green">Exits: north</span>\n');
        });

      });

      test('should display room id when user is an admin', () => {
        socket.user.debug = true;
        return room.look(socket).then(output => {
          expect(output).toEqual(`<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="gray">Room ID: ${room.id}</span>\n<span class="gray">Room coords: ${room.x}, ${room.y}</span>\n`);
        });

      });
    });

    describe('getMobById', () => {
      test('should return mob by in the room', () => {
        let mob = Object.create(Mob.prototype);
        mob.displayName = 'Test Mob';
        room.mobs = [mob];

        let result = room.getMobById(mob.id);

        expect(result).toBe(mob);
      });

      test('should return falsy when mob not found', () => {
        let mob = Object.create(Mob.prototype);
        mob.displayName = 'Test Mob';

        let result = room.getMobById(mob.id);

        expect(result).toBeFalsy();
      });
    });

    describe('dirToCoords', () => {
      const dirToCoordsParamTest = (inputDir, expectedOutput) => {
        test('should return correct direction', () => {
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
      test('should return undefined if exit does not exists', () => {
        let result = room.getExit('s');

        expect(result).toBeUndefined();
      });

      test('should return exit object when exit exists', () => {
        let exit = { _id: new ObjectId(), dir: 'n', roomId: new ObjectId() };
        room.exits.push(exit);

        let result = room.getExit('n');

        expect(result.dir).toEqual(exit.dir);
        expect(result.roomId.toString()).toEqual(exit.roomId.toString());
      });

    });

    describe('addExit', () => {
      test('should return false if exit already exists', () => {
        let exit = { _id: new ObjectId(), dir: 's', roomId: new ObjectId() };
        room.exits.push(exit);

        let result = room.addExit('s');

        expect(result).toBeFalsy();
      });

      test('should return true when exit successfully added to object', () => {
        let result = room.addExit('e');

        let exit = room.exits.find(({ dir }) => dir === 'e');

        expect(result).toBeTruthy();
        expect(exit).toBeDefined();
      });
    });

    describe('processPlayerCombatActions', () => {
      test('should iterate over players in room with attackTarget', () => {
        // arrange

        // add three mobs to the room
        const mob1 = mocks.getMockMob();
        mob1.id = 'mob1';
        const mob2 = mocks.getMockMob();
        mob1.id = 'mob2';
        const mob3 = mocks.getMockMob();
        mob1.id = 'mob3';
        room.mobs = [mob1, mob2, mob3];

        // set attack targets for three players
        const socketA = new mocks.SocketMock();
        socketA.character.attackTarget = mob1.id;
        const socketB = new mocks.SocketMock();
        socketB.character.attackTarget = mob2.id;
        const socketC = new mocks.SocketMock();
        socketC.character.attackTarget = mob3.id;

        mockGetRoomSockets.mockReturnValueOnce([socketA, socketB, socketC]);

        // act
        room.processPlayerCombatActions(new Date());

        // assert
        expect(socketA.character.attack).toHaveBeenCalled();
        expect(socketB.character.attack).toHaveBeenCalled();
        expect(socketC.character.attack).toHaveBeenCalled();
      });

      test('should not call attack when player attack target is null', () => {
        // arrange

        // add three mobs to the room
        const mob1 = mocks.getMockMob();
        mob1.id = 'mob1';
        const mob2 = mocks.getMockMob();
        mob1.id = 'mob2';
        const mob3 = mocks.getMockMob();
        mob1.id = 'mob3';
        room.mobs = [mob1, mob2, mob3];

        // set attack targets for two of three players
        const socketA = new mocks.SocketMock();
        socketA.character.attackTarget = mob1.id;
        const socketB = new mocks.SocketMock();
        socketB.character.attackTarget = null;
        const socketC = new mocks.SocketMock();
        socketC.character.attackTarget = mob3.id;
        mockGetRoomSockets.mockReturnValueOnce([socketA, socketB, socketC]);

        // act
        room.processPlayerCombatActions(new Date());

        // assert
        expect(socketA.character.attack).toHaveBeenCalled();
        expect(socketB.character.attack).not.toHaveBeenCalled();
        expect(socketC.character.attack).toHaveBeenCalled();
      });
    });

    describe('processMobCombatActions', () => {
      beforeEach(() => {
        global.io.reset();
      });

      test('should call attack and taunt on all mobs', () => {
        // arrange
        const socket = new mocks.SocketMock();
        const mobType = mobData.catalog[0];
        room.mobs = [];

        const mobA = new Mob(mobType, room.id);
        mobA.attack = jest.fn().mockName('mobAattack');
        mobA.taunt = jest.fn().mockName('mobAtaunt');
        room.mobs.push(mobA);

        const mobB = new Mob(mobType, room.id);
        mobB.attack = jest.fn().mockName('mobBattack').mockReturnValue(true);
        mobB.taunt = jest.fn().mockName('mobBtaunt');
        mobB.attackTarget = socket;
        room.mobs.push(mobB);

        const mobC = new Mob(mobType, room.id);
        mobC.attack = jest.fn().mockName('mobCattack');
        mobC.taunt = jest.fn().mockName('mobCtaunt');
        room.mobs.push(mobC);

        // act
        room.processMobCombatActions();

        // assert
        expect(room.mobs[0].attack).toHaveBeenCalled();
        expect(room.mobs[0].taunt).not.toHaveBeenCalled();
        expect(room.mobs[1].attack).toHaveBeenCalled();
        expect(room.mobs[1].taunt).toHaveBeenCalled();
        expect(room.mobs[2].attack).toHaveBeenCalled();
        expect(room.mobs[2].taunt).not.toHaveBeenCalled();
      });
    });
  });
});
