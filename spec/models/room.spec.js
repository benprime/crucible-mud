'use strict';

const mocks = require('../mocks');
const Room = require('../../models/room');

describe('room model', function () {

  describe('static method', function () {

    describe('getById', function () {
      it('should return correct room', function () {
        Room.roomCache['123'] = {
          name: 'a room',
        };

        const result = Room.getById('123');

        expect(result.name).toEqual('a room');
      });

      it('should return undefined when room not found', function () {
        Room.roomCache['123'] = {
          name: 'a room',
        };

        const result = Room.getById('222');

        expect(result).toBeUndefined();
      });
    });

    describe('oppositeDirection', function () {
      const oppositeDirectionParamTest = function (inputDir, expectedOutput) {
        it('should return correct direction', function () {
          const result = Room.oppositeDirection(inputDir);

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


    describe('byCoords', function () {
      beforeEach(function () {
        spyOn(Room, 'findOne');
      });

      it('should call findOne with coordinates', function () {
        const coords = {
          x: 1,
          y: 2,
          z: 3,
        };

        Room.byCoords(coords);

        expect(Room.findOne).toHaveBeenCalledWith(coords, undefined);
      });
    });

    describe('shortToLong', function () {
      const shortToLongParamTest = function (inputDir, expectedOutput) {
        it('should return correct long direction name', function () {
          const result = Room.shortToLong(inputDir);

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

    describe('longToShort', function () {
      const longToShortParamTest = function (inputDir, expectedOutput) {
        it('should return correct short direction name', function () {
          const result = Room.longToShort(inputDir);

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

    describe('validDirectionInput', function () {
      const validDirParamTest = function (inputDir, expectedOutput) {
        it('should return correct response', function () {
          const result = Room.validDirectionInput(inputDir);

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

  describe('instance method', function () {
    let room;
    beforeEach(function () {
      room = new Room();
    });

    describe('socketInRoom', function () {
      let socket;
      beforeEach(function () {
        socket = new mocks.SocketMock();
        global.io = new mocks.IOMock();
        let ioRoom = {};
        global.io.sockets.adapter.rooms[room.id] = ioRoom;
        let sockets = {};
        sockets[socket.id] = {};
        ioRoom.sockets = sockets;
      });

      it('should return true when socket in room', function () {
        const result = room.socketInRoom(socket.id);

        expect(result).toBe(true);
      });

      it('should return false when socket not in room', function () {
        const result = room.socketInRoom('socket id not in room');

        expect(result).toBe(false);
      });
    });

    describe('usersInRoom', function () {
      let socket;
      beforeEach(function () {
        socket = new mocks.SocketMock();
        global.io = new mocks.IOMock();
      });

      it('should return empty array when no users in room', function () {
        global.io.sockets.adapter.rooms[room.id] = {};
        global.io.sockets.adapter.rooms[room.id].sockets = {};

        const result = room.usersInRoom(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(0);
      });

      it('should return array of names when users in room', function () {
        const sockets = {};
        sockets[socket.id] = new mocks.SocketMock();
        sockets[socket.id].user.username = 'TestUser1';
        sockets['socket2'] = new mocks.SocketMock();
        sockets['socket2'].user.username = 'TestUser2';

        global.io.sockets.adapter.rooms[room.id] = {
          sockets: sockets,
        };
        global.io.sockets.connected = sockets;

        const result = room.usersInRoom(socket.id);

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
        expect(result).toEqual(['TestUser1', 'TestUser2']);
      });
    });

    describe('createRoom', function () {
      let socket;
      let room;
      
      beforeAll(function () {
        socket = new mocks.SocketMock();
        global.io = new mocks.IOMock();
      });

      beforeEach(function () {
        socket.reset();
        global.io.reset();
        room = new Room();
      });

      it('should return false if direction is invalid', function () {
        const result = room.createRoom('invalid direction');

        expect(result).toBe(false);
        expect(socket.emit).not.toHaveBeenCalled();
      });

      it('should return false if there is already an exit in a valid input direction', function () {
        room.exits.push({dir: 'n', roomId: 'some-id'});
        const result = room.createRoom('n');

        expect(result).toBe(false);
        expect(socket.emit).not.toHaveBeenCalled();
      });

      it('should create a new room if room does not already exist in target direction', function () {

      });

      it('should only make a new door if room exists at coords in target direction', function () {

      });

      it('should update room cache on success', function () {

      });

      it('should execute callback if passed', function () {

      });
    });

    describe('getSockets', function () { });

    describe('look', function () { });

    describe('getMobById', function () { });

    describe('dirToCoords', function () { });

    describe('getExit', function () { });

    describe('addExit', function () { });
  });
});