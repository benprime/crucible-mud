import { mockGetRoomSockets, mockGetSocketByCharacterId } from '../core/socketUtil';
import directions, { getDirection } from '../core/directions';
import Mob from './mob';
import mobData from '../data/mobData';
import mocks from '../../spec/mocks';
import { Types } from 'mongoose';
const { ObjectId } = Types;
import sutModel from './room';

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

    describe('getCharacterNames', () => {
      let socket;
      beforeEach(() => {
        socket = new mocks.SocketMock();
      });

      test('should return empty array when no users in room', () => {
        mockGetRoomSockets.mockReturnValueOnce([]);

        const result = room.getCharacterNames(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(0);
      });

      test('should return a users when users in room', () => {
        const socket1 = new mocks.SocketMock();
        socket1.character.name = 'TestUser1';
        const socket2 = new mocks.SocketMock();
        socket2.character.name = 'TestUser2';
        mockGetRoomSockets.mockReturnValueOnce([socket1, socket2]);

        const result = room.getCharacterNames(socket.id);

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
          expect(response).toBe('Invalid direction.');
        });
      });

      test('should return false if there is already an exit in a valid input direction', () => {
        room.exits.push({ dir: 'n', roomId: 'some-id' });
        return room.createRoom(directions.N).catch(response => {
          expect(response).toBe('Exit already exists');
        });
      });

      describe('successful creation', () => {
        let resultRoom;

        beforeEach(() => {
          room.save = jest.fn(() => Promise.resolve(room));
          resultRoom = mocks.getMockRoom();
          resultRoom.save = jest.fn(() => Promise.resolve(resultRoom));
        });

        test('should create a new room if room does not already exist in target direction', () => {

          return room.createRoom(directions.S).then(newRoom => {
            // verify target room door
            const roomExit = room.exits.find(({ dir }) => dir === 's');
            expect(roomExit).not.toBeUndefined();
            expect(roomExit.roomId).toBe(newRoom.id);

            // verify this door
            const newRoomExit = newRoom.exits.find(({ dir }) => dir === 'n');
            expect(newRoomExit).not.toBeUndefined();
            expect(newRoomExit.roomId).toBe(room.id);

            // verify cache
            expect(newRoom.id in sutModel.roomCache).toBe(true);
          });
        });

        test('should not load new room to cache when creating a door in a direction where room exists', () => {
          resultRoom.exits = [];
          room.x = 5;
          room.y = 5;
          room.z = 5;
          resultRoom.x = 5;
          resultRoom.y = 4;
          resultRoom.z = 5;
          sutModel.roomCache = {};
          sutModel.roomCache[resultRoom.id] = resultRoom;


          return room.createRoom(directions.S).then(updatedTargetRoom => {
            // verify target room door
            const roomExit = room.exits.find(({ dir }) => dir === 's');
            expect(roomExit).not.toBeUndefined();
            expect(roomExit.roomId).toBe(updatedTargetRoom.id);

            // verify this door
            const targetRoomExit = updatedTargetRoom.exits.find(({ dir }) => dir === 'n');
            expect(targetRoomExit).not.toBeUndefined();
            expect(targetRoomExit.roomId).toBe(room.id);

            expect(updatedTargetRoom.id in sutModel.roomCache).toBe(false);
          });
        });

      });
    });

    describe('getDesc', () => {

      let socket;

      beforeEach(() => {
        socket = new mocks.SocketMock();
        mockGetSocketByCharacterId.mockReturnValue(socket);
      });

      test('should build output string with just title and exits when short parameter is passed', () => {
        mockGetRoomSockets.mockReturnValueOnce([]);
        let output = room.getDesc(socket.character, true);
        expect(output).toEqual('<span class="cyan">Test sutModel</span>\n');
      });

      test('should build output string with description when short parameter is false', () => {
        mockGetRoomSockets.mockReturnValueOnce([]);
        let output = room.getDesc(socket.character, false);
        expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n');
      });

      test('should include inventory in output when inventory length is not zero', () => {
        mockGetRoomSockets.mockReturnValueOnce([]);
        room.inventory = [{ name: 'An Item' }];
        let output = room.getDesc(socket.character);
        expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="darkcyan">You notice: An Item.</span>\n');
      });

      test('should include users in room when the user is not the only user in room', () => {
        const socket1 = new mocks.SocketMock();
        socket1.character.name = 'TestUser1';
        const socket2 = new mocks.SocketMock();
        socket2.character.name = 'TestUser2';
        mockGetRoomSockets.mockReturnValueOnce([socket1, socket2]);

        let output = room.getDesc(socket.character);
        expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="mediumOrchid">Also here: <span class="teal">TestUser1<span class="mediumOrchid">, </span>TestUser2</span>.</span>\n');
      });

      test('should include exits when there is at least one exit in the room', () => {
        mockGetRoomSockets.mockReturnValueOnce([]);
        room.exits = [{ dir: 'n' }];
        let output = room.getDesc(socket.character);
        expect(output).toEqual('<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="green">Exits: north</span>\n');

      });

      test('should display room id when user is an admin', () => {
        mockGetRoomSockets.mockReturnValueOnce([]);
        socket.user.debug = true;
        let output = room.getDesc(socket.character);
        expect(output).toEqual(`<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="gray">Room ID: ${room.id}</span>\n<span class="gray">Room coords: ${room.x}, ${room.y}</span>\n`);
      });
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
        const dir = getDirection('s');

        let result = room.addExit(dir);

        expect(result).toBeFalsy();
      });

      test('should return true when exit successfully added to object', () => {
        const dir = getDirection('e');
        let result = room.addExit(dir);

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
        const mobType = mobData.catalog[0];
        room.mobs = [];

        const mobA = new Mob(mobType, room.id);
        mobA.attack = jest.fn().mockName('mobAattack');
        mobA.taunt = jest.fn().mockName('mobAtaunt');
        room.mobs.push(mobA);

        const mobB = new Mob(mobType, room.id);
        mobB.attack = jest.fn().mockName('mobBattack');
        mobB.taunt = jest.fn().mockName('mobBtaunt');
        room.mobs.push(mobB);

        const mobC = new Mob(mobType, room.id);
        mobC.attack = jest.fn().mockName('mobCattack');
        mobC.taunt = jest.fn().mockName('mobCtaunt');
        room.mobs.push(mobC);

        // act
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        room.processMobCombatActions(now);

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
