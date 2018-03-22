'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/move');
const breakCommand = require('../../commands/break');
const lookCommand = require('../../commands/look');
const Room = require('../../models/room');
const autocomplete = require('../../autocomplete');

describe('move', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch', function () {
    beforeEach(function () {
      spyOn(sut, 'execute');
    });

    it('should call execute with direction match', function () {
      sut.dispatch(socket, ['aMatch']);
      
      expect(sut.execute).toHaveBeenCalledWith(socket, 'aMatch');
    });

    it('should call execute with command match', function () {
      sut.dispatch(socket, ['go aMatch']);

      expect(sut.execute).toHaveBeenCalledWith(socket, 'aMatch');
    });
  });

  describe('execute', function () {
    let room;
    let autocompleteResult;
    let shortDir;

    beforeEach(function () {
      room = mocks.getMockRoom();
      shortDir = 'n';
      spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => autocompleteResult);
      spyOn(Room, 'getById').and.callFake(() => room);
      spyOn(Room, 'oppositeDirection').and.callFake(() => 'opposite');
      spyOn(Room, 'shortToLong').and.callFake(() => 'exit name');
      spyOn(Room, 'validDirectionInput').and.callFake(() => shortDir);
      spyOn(breakCommand, 'execute');
      spyOn(lookCommand, 'execute');
      socket.emit.calls.reset();
      socket.broadcast.to().emit.calls.reset();
    });

    it('should output message when direction is up and there is no exit', function () {
      shortDir = 'u';
      var exitIndex = room.exits.findIndex(e => e.dir === 'u');
      room.exits.splice(exitIndex, 1);

      sut.execute(socket, shortDir);

      expect(socket.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the ceiling.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    it('should output message when direction is down and there is no exit', function () {
      shortDir = 'd';
      var exitIndex = room.exits.findIndex(e => e.dir === 'd');
      room.exits.splice(exitIndex, 1);

      sut.execute(socket, shortDir);

      expect(socket.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the floor.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    it('should output message when direction is not up or down and there is no exit', function () {
      shortDir = 'zzz';
      sut.execute(socket, shortDir);

      expect(socket.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the wall to the exit name.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    it('should output message when direction is up and there is a closed exit', function () {
      shortDir = 'u';
      let exitIndex = room.exits.findIndex(e => e.dir === 'u');
      room.exits[exitIndex].closed = true;
      sut.execute(socket, shortDir);

      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the closed door above.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    it('should output message when direction is down and there is a closed exit', function () {
      shortDir = 'd';
      let exitIndex = room.exits.findIndex(e => e.dir === 'd');
      room.exits[exitIndex].closed = true;
      sut.execute(socket, shortDir);

      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the trapdoor on the floor.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    it('should output message when direction is not up or down and there is a closed exit', function () {
      shortDir = 'w';
      let exitIndex = room.exits.findIndex(e => e.dir === 'w');
      room.exits[exitIndex].closed = true;
      sut.execute(socket, shortDir);

      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the door to the exit name.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    it('should output message when room is not found', function () {
      room = undefined;
      shortDir = 'u';
      sut.execute(socket, shortDir);

      expect(socket.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the ceiling.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    it('should process movement when direction is up', function () {
      shortDir = 'u';
      var exit = room.exits.find(e => e.dir === shortDir);
      exit.closed = false;

      sut.execute(socket, shortDir);

      expect(breakCommand.execute).toHaveBeenCalledWith(socket);
      expect(socket.broadcast.to(room.id).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} has gone above.` });
      expect(socket.broadcast.to(exit.roomId).emit.calls.argsFor(0)).toEqual(['output', { message: 'You hear movement from below.' }]);
      expect(socket.broadcast.to(exit.roomId).emit.calls.argsFor(1)).toEqual(['output', { message: `${socket.user.username} has entered from below.` }]);
      expect(socket.leave).toHaveBeenCalledWith(room.id);
      expect(socket.user.save).toHaveBeenCalled();
      expect(socket.join).toHaveBeenCalledWith(exit.roomId);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You move exit name...' });
      expect(lookCommand.execute).toHaveBeenCalledWith(socket);
    });

    it('should process movement when direction is down', function () {
      shortDir = 'd';
      var exit = room.exits.find(e => e.dir === shortDir);
      exit.closed = false;

      sut.execute(socket, shortDir);

      expect(breakCommand.execute).toHaveBeenCalledWith(socket);
      expect(socket.broadcast.to(room.id).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} has gone below.` });
      expect(socket.broadcast.to(exit.roomId).emit.calls.argsFor(0)).toEqual(['output', { message: 'You hear movement from above.' }]);
      expect(socket.broadcast.to(exit.roomId).emit.calls.argsFor(1)).toEqual(['output', { message: `${socket.user.username} has entered from above.` }]);
      expect(socket.leave).toHaveBeenCalledWith(room.id);
      expect(socket.user.save).toHaveBeenCalled();
      expect(socket.join).toHaveBeenCalledWith(exit.roomId);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You move exit name...' });
      expect(lookCommand.execute).toHaveBeenCalledWith(socket);
    });

    it('should process movement when direction is not up or down', function () {
      shortDir = 'w';
      var exit = room.exits.find(e => e.dir === shortDir);
      exit.closed = false;

      sut.execute(socket, shortDir);

      expect(breakCommand.execute).toHaveBeenCalledWith(socket);
      expect(socket.broadcast.to(room.id).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} has left to the exit name.` });
      expect(socket.broadcast.to(exit.roomId).emit.calls.argsFor(0)).toEqual(['output', { message: 'You hear movement to the exit name.' }]);
      expect(socket.broadcast.to(exit.roomId).emit.calls.argsFor(1)).toEqual(['output', { message: `${socket.user.username} has entered from the exit name.` }]);
      expect(socket.leave).toHaveBeenCalledWith(room.id);
      expect(socket.user.save).toHaveBeenCalled();
      expect(socket.join).toHaveBeenCalledWith(exit.roomId);
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You move exit name...' });
      expect(lookCommand.execute).toHaveBeenCalledWith(socket);
    });
  });

  describe('help', function () {
    it('should print help message', function () {
      sut.help(socket);

      let output = '';
      output += '<span class="cyan">move command </span><span class="darkcyan">-</span> Move in specified direction. Move command word is not used.<br />';
      output += '<span class="mediumOrchid">n<span class="purple"> | </span>north</span> <span class="purple">-</span> Move north.<br />';
      output += '<span class="mediumOrchid">s<span class="purple"> | </span>south</span> <span class="purple">-</span> Move south.<br />';
      output += '<span class="mediumOrchid">e<span class="purple"> | </span>east</span> <span class="purple">-</span> Move east.<br />';
      output += '<span class="mediumOrchid">w<span class="purple"> | </span>west</span> <span class="purple">-</span> Move west.<br />';
      output += '<span class="mediumOrchid">ne<span class="purple"> | </span>northeast</span> <span class="purple">-</span> Move northeast.<br />';
      output += '<span class="mediumOrchid">se<span class="purple"> | </span>southeast</span> <span class="purple">-</span> Move southeast.<br />';
      output += '<span class="mediumOrchid">nw<span class="purple"> | </span>northwest</span> <span class="purple">-</span> Move northwest.<br />';
      output += '<span class="mediumOrchid">sw<span class="purple"> | </span>southwest</span> <span class="purple">-</span> Move southwest.<br />';
      output += '<span class="mediumOrchid">u<span class="purple"> | </span>up</span> <span class="purple">-</span> Move up.<br />';
      output += '<span class="mediumOrchid">d<span class="purple"> | </span>down</span> <span class="purple">-</span> Move down.<br />';

      expect(socket.emit).toHaveBeenCalledWith('output', { message: output });
    });
  });
});