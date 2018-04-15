// 'use strict';

// const socketUtil = require('../core/socketUtil');
// const SandboxedModule = require('sandboxed-module');
// const mocks = require('../../spec/mocks');

// let mockGlobalIO = new mocks.IOMock();

// const Mob = require('../models/mob');
// const ObjectId = require('mongodb').ObjectId;
// const mobData = require('../../data/mobData');

// const sutModel = SandboxedModule.require('../models/room', {
//   globals: {io:mockGlobalIO},
// });

// describe('room model', function () {

//   beforeEach(function () {
//     //socket = new mocks.SocketMock();
//     mockGlobalIO.reset();
//   });

//   describe('static method', function () {

//     describe('getById', function () {
//       it('should return correct room', function () {
//         sutModel.roomCache['123'] = {
//           name: 'a room',
//         };

//         const result = sutModel.getById('123');

//         expect(result.name).toEqual('a room');
//       });

//       it('should return undefined when room not found', function () {
//         sutModel.roomCache['123'] = {
//           name: 'a room',
//         };

//         const result = sutModel.getById('222');

//         expect(result).toBeUndefined();
//       });
//     });

//     describe('oppositeDirection', function () {
//       const oppositeDirectionParamTest = function (inputDir, expectedOutput) {
//         it('should return correct direction', function () {
//           const result = sutModel.oppositeDirection(inputDir);

//           expect(result).toBe(expectedOutput);
//         });
//       };
//       oppositeDirectionParamTest('n', 's');
//       oppositeDirectionParamTest('ne', 'sw');
//       oppositeDirectionParamTest('e', 'w');
//       oppositeDirectionParamTest('se', 'nw');
//       oppositeDirectionParamTest('s', 'n');
//       oppositeDirectionParamTest('sw', 'ne');
//       oppositeDirectionParamTest('w', 'e');
//       oppositeDirectionParamTest('nw', 'se');
//       oppositeDirectionParamTest('u', 'd');
//       oppositeDirectionParamTest('d', 'u');
//       oppositeDirectionParamTest('?', null);
//     });


//     describe('byCoords', function () {
//       beforeEach(function () {
//         spyOn(sutModel, 'findOne');
//       });

//       it('should call findOne with coordinates', function () {
//         const coords = {
//           x: 1,
//           y: 2,
//           z: 3,
//         };

//         sutModel.byCoords(coords);

//         expect(sutModel.findOne).toHaveBeenCalledWith(coords, undefined);
//       });
//     });

//     describe('shortToLong', function () {
//       const shortToLongParamTest = function (inputDir, expectedOutput) {
//         it('should return correct long direction name', function () {
//           const result = sutModel.shortToLong(inputDir);

//           expect(result).toBe(expectedOutput);
//         });
//       };
//       shortToLongParamTest('n', 'north');
//       shortToLongParamTest('ne', 'northeast');
//       shortToLongParamTest('e', 'east');
//       shortToLongParamTest('se', 'southeast');
//       shortToLongParamTest('s', 'south');
//       shortToLongParamTest('sw', 'southwest');
//       shortToLongParamTest('w', 'west');
//       shortToLongParamTest('nw', 'northwest');
//       shortToLongParamTest('u', 'up');
//       shortToLongParamTest('d', 'down');
//       shortToLongParamTest('?', '?');
//     });

//     describe('longToShort', function () {
//       const longToShortParamTest = function (inputDir, expectedOutput) {
//         it('should return correct short direction name', function () {
//           const result = sutModel.longToShort(inputDir);

//           expect(result).toBe(expectedOutput);
//         });
//       };
//       longToShortParamTest('north', 'n');
//       longToShortParamTest('northeast', 'ne');
//       longToShortParamTest('east', 'e');
//       longToShortParamTest('southeast', 'se');
//       longToShortParamTest('south', 's');
//       longToShortParamTest('southwest', 'sw');
//       longToShortParamTest('west', 'w');
//       longToShortParamTest('northwest', 'nw');
//       longToShortParamTest('up', 'u');
//       longToShortParamTest('down', 'd');
//       longToShortParamTest('?', '?');
//     });

//     describe('validDirectionInput', function () {
//       const validDirParamTest = function (inputDir, expectedOutput) {
//         it('should return correct response', function () {
//           const result = sutModel.validDirectionInput(inputDir);

//           expect(result).toBe(expectedOutput);
//         });
//       };
//       validDirParamTest('north', 'n');
//       validDirParamTest('n', 'n');
//       validDirParamTest('northeast', 'ne');
//       validDirParamTest('ne', 'ne');
//       validDirParamTest('east', 'e');
//       validDirParamTest('e', 'e');
//       validDirParamTest('southeast', 'se');
//       validDirParamTest('se', 'se');
//       validDirParamTest('south', 's');
//       validDirParamTest('s', 's');
//       validDirParamTest('southwest', 'sw');
//       validDirParamTest('sw', 'sw');
//       validDirParamTest('west', 'w');
//       validDirParamTest('w', 'w');
//       validDirParamTest('northwest', 'nw');
//       validDirParamTest('nw', 'nw');
//       validDirParamTest('up', 'u');
//       validDirParamTest('u', 'u');
//       validDirParamTest('down', 'd');
//       validDirParamTest('d', 'd');
//       validDirParamTest('?', null);
//     });
//   });

//   describe('instance method', function () {
//     let room;
//     beforeEach(function () {
//       room = new sutModel({
//         name: 'Test sutModel',
//         desc: 'Test sutModel Description',
//       });
//       room.mobs = [];
//       sutModel.prototype.save = jasmine.createSpy('room save spy').and.callFake((cb) => {
//         if (cb) {
//           cb(null, new sutModel({ id: '12345' }));
//         }
//       });
//     });

//     describe('usersInsutModel', function () {
//       let socket;
//       beforeEach(function () {
//         socket = new mocks.SocketMock();
//         //mockGlobalIO.reset();
//       });

//       it('should return empty array when no users in room', function () {
//         mockGlobalIO.sockets.adapter.rooms[room.id] = {};
//         mockGlobalIO.sockets.adapter.rooms[room.id].sockets = {};

//         const result = room.usersInsutModel(socket.id);

//         expect(Array.isArray(result)).toBe(true);
//         expect(result.length).toBe(0);
//       });

//       it('should return array of names when users in room', function () {
//         const sockets = {};
//         sockets[socket.id] = new mocks.SocketMock();
//         sockets[socket.id].user.username = 'TestUser1';
//         sockets['socket2'] = new mocks.SocketMock();
//         sockets['socket2'].user.username = 'TestUser2';

//         mockGlobalIO.sockets.adapter.rooms[room.id] = {
//           sockets: sockets,
//         };
//         mockGlobalIO.sockets.connected = sockets;

//         const result = room.usersInsutModel(socket.id);

//         expect(Array.isArray(result)).toBe(true);
//         expect(result.length).toBe(2);
//         expect(result).toEqual(['TestUser1', 'TestUser2']);
//       });
//     });

//     describe('createsutModel', function () {
//       let socket;
//       let room;

//       beforeAll(function () {
//         socket = new mocks.SocketMock();
//         mockGlobalIO.reset();
//       });

//       beforeEach(function () {
//         socket.reset();
//         mockGlobalIO.reset();
//         room = new sutModel();
//       });

//       it('should return false if direction is invalid', function () {
//         room.createsutModel('invalid direction', (result) => {
//           expect(result).toBe(false);
//           expect(socket.emit).not.toHaveBeenCalled();
//           expect(sutModel.prototype.save).not.toHaveBeenCalled();
//         });
//       });

//       it('should return false if there is already an exit in a valid input direction', function () {
//         room.exits.push({ dir: 'n', roomId: 'some-id' });
//         room.createsutModel('n', (result) => {
//           expect(result).toBe(false);
//           expect(socket.emit).not.toHaveBeenCalled();
//           expect(sutModel.prototype.save).not.toHaveBeenCalled();
//         });
//       });

//       it('should create a new room if room does not already exist in target direction', function () {
//         // mock "findByCoords"
//         spyOn(sutModel, 'findOne').and.callFake(function (coords, cb) {
//           cb(null);
//         });

//         room.createsutModel('s', (result) => {
//           var exit = room.exits.find(e => e.dir === 's');

//           expect(exit).not.toBeUndefined();
//           expect(result.id in sutModel.roomCache).toBe(true);
//           expect(sutModel.prototype.save).toHaveBeenCalledTimes(2);
//         });
//       });

//       it('should not load new room to cache when creating a door in a direction where room exists', function () {
//         // mock "findByCoords"
//         spyOn(sutModel, 'findOne').and.callFake(function (coords, cb) {
//           cb(new sutModel());
//         });

//         room.createsutModel('s', (result) => {
//           var exit = room.exits.find(e => e.dir === 's');

//           expect(exit).not.toBeUndefined();
//           expect(result.id in sutModel.roomCache).toBe(false);
//           expect(sutModel.prototype.save).toHaveBeenCalledTimes(2);
//         });
//       });
//     });

//     describe('look', function () {

//       let socket;

//       beforeEach(function () {
//         socket = new mocks.SocketMock();
//       });

//       it('should build output string with just title and exits when short parameter is passed', function () {
//         room.look(socket, true);

//         expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n' });
//       });

//       it('should build output string with description when short parameter is false', function () {
//         room.look(socket, false);

//         expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n' });
//       });

//       it('should include inventory in output when inventory length is not zero', function () {
//         room.inventory = [{ displayName: 'An Item' }];
//         room.look(socket);

//         expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="darkcyan">You notice: An Item.</span>\n' });
//       });

//       it('should include users in room when the user is not the only user in room', function () {
//         const sockets = {};
//         sockets[socket.id] = new mocks.SocketMock();
//         sockets[socket.id].user.username = 'TestUser1';
//         sockets['socket2'] = new mocks.SocketMock();
//         sockets['socket2'].user.username = 'TestUser2';

//         mockGlobalIO.sockets.adapter.rooms[room.id] = {
//           sockets: sockets,
//         };
//         mockGlobalIO.sockets.connected = sockets;

//         room.look(socket);

//         expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="purple">Also here: <span class="teal">TestUser1<span class="mediumOrchid">, </span>TestUser2</span>.</span>\n' });
//       });

//       it('should include exits when there is at least one exit in the room', function () {
//         room.exits = [{ dir: 'n' }];
//         room.look(socket);

//         expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="green">Exits: north</span>\n' });
//       });

//       it('should display room id when user is an admin', function () {
//         socket.user.admin = true;
//         room.look(socket);

//         expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="cyan">Test sutModel</span>\n<span class="silver">Test sutModel Description</span>\n<span class="gray">sutModel ID: ' + room.id + '</span>\n' });
//       });
//     });

//     describe('getMobById', function () {
//       it('should return mob by in the room', function () {
//         let mob = Object.create(Mob.prototype);
//         mob.displayName = 'Test Mob';
//         room.mobs = [mob];

//         let result = room.getMobById(mob.id);

//         expect(result).toBe(mob);
//       });

//       it('should return falsy when mob not found', function () {
//         let mob = Object.create(Mob.prototype);
//         mob.displayName = 'Test Mob';

//         let result = room.getMobById(mob.id);

//         expect(result).toBeFalsy();
//       });
//     });

//     describe('dirToCoords', function () {
//       const dirToCoordsParamTest = function (inputDir, expectedOutput) {
//         it('should return correct direction', function () {
//           const result = sutModel.oppositeDirection(inputDir);

//           expect(result).toBe(expectedOutput);
//         });
//       };
//       dirToCoordsParamTest('n', 's');
//       dirToCoordsParamTest('ne', 'sw');
//       dirToCoordsParamTest('e', 'w');
//       dirToCoordsParamTest('se', 'nw');
//       dirToCoordsParamTest('s', 'n');
//       dirToCoordsParamTest('sw', 'ne');
//       dirToCoordsParamTest('w', 'e');
//       dirToCoordsParamTest('nw', 'se');
//       dirToCoordsParamTest('u', 'd');
//       dirToCoordsParamTest('d', 'u');
//       dirToCoordsParamTest('?', null);
//     });

//     describe('getExit', function () {
//       it('should return undefined if exit does not exists', function () {
//         let result = room.getExit('s');

//         expect(result).toBeUndefined();
//       });

//       it('should return exit object when exit exists', function () {
//         let exit = { _id: new ObjectId(), dir: 'n', roomId: new ObjectId() };
//         room.exits.push(exit);

//         let result = room.getExit('n');

//         expect(result.dir).toEqual(exit.dir);
//         expect(result.roomId.toString()).toEqual(exit.roomId.toString());
//       });

//     });

//     describe('addExit', function () {
//       it('should return false if exit already exists', function () {
//         let exit = { _id: new ObjectId(), dir: 's', roomId: new ObjectId() };
//         room.exits.push(exit);

//         let result = room.addExit('s');

//         expect(result).toBeFalsy();
//       });

//       it('should return true when exit successfully added to object', function () {
//         let result = room.addExit('e');

//         let exit = room.exits.find(e => e.dir === 'e');

//         expect(result).toBeTruthy();
//         expect(exit).toBeDefined();
//       });
//     });

//     describe('processPlayerCombatActions', function () {
//       it('should iterate over players in room with attackTarget', function () {
//         // arrange
//         const socketA = new mocks.SocketMock();
//         socketA.user.attackTarget = {};
//         const socketB = new mocks.SocketMock();
//         socketB.user.attackTarget = {};
//         const socketC = new mocks.SocketMock();
//         socketC.user.attackTarget = {};
//         spyOn(socketUtil, 'getsutModelSockets').and.callFake(() => [socketA, socketB, socketC]);
//         spyOn(room, 'getMobById').and.returnValue({});

//         // act
//         room.processPlayerCombatActions(new Date());

//         // assert
//         expect(socketA.user.attack).toHaveBeenCalled();
//         expect(socketB.user.attack).toHaveBeenCalled();
//         expect(socketC.user.attack).toHaveBeenCalled();
//       });

//       it('should not call attack when player attack target is null', function () {
//         // arrange
//         const socketA = new mocks.SocketMock();
//         socketA.user.attackTarget = {};
//         const socketB = new mocks.SocketMock();
//         socketB.user.attackTarget = null;
//         const socketC = new mocks.SocketMock();
//         socketC.user.attackTarget = {};
//         spyOn(socketUtil, 'getsutModelSockets').and.callFake(() => [socketA, socketB, socketC]);
//         spyOn(room, 'getMobById').and.returnValue({});

//         // act
//         room.processPlayerCombatActions(new Date());

//         // assert
//         expect(socketA.user.attack).toHaveBeenCalled();
//         expect(socketB.user.attack).not.toHaveBeenCalled();
//         expect(socketC.user.attack).toHaveBeenCalled();
//       });
//     });

//     describe('processMobCombatActions', function () {
//       beforeEach(function () {
//         mockGlobalIO.reset();
//       });

//       it('should call attack and taunt on all mobs', function () {
//         // arrange
//         const mobType = mobData.catalog[0];
//         room.mobs = [];

//         const mobA = new Mob(mobType, room.id);
//         mobA.attack = jasmine.createSpy('mobAattack');
//         mobA.taunt = jasmine.createSpy('mobAtaunt');
//         room.mobs.push(mobA);

//         const mobB = new Mob(mobType, room.id);
//         mobB.attack = jasmine.createSpy('mobBattack');
//         mobB.taunt = jasmine.createSpy('mobBtaunt');
//         room.mobs.push(mobB);

//         const mobC = new Mob(mobType, room.id);
//         mobC.attack = jasmine.createSpy('mobCattack');
//         mobC.taunt = jasmine.createSpy('mobCtaunt');
//         room.mobs.push(mobC);

//         // act
//         room.processMobCombatActions();

//         // assert
//         expect(room.mobs[0].attack).toHaveBeenCalled();
//         expect(room.mobs[0].taunt).toHaveBeenCalled();
//         expect(room.mobs[1].attack).toHaveBeenCalled();
//         expect(room.mobs[1].taunt).toHaveBeenCalled();
//         expect(room.mobs[2].attack).toHaveBeenCalled();
//         expect(room.mobs[2].taunt).toHaveBeenCalled();
//       });
//     });
//   });
// });
