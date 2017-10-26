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

  describe('dispatch', function(){
    beforeEach(function(){
      spyOn(sut, 'execute');
    });

    it('should call execute with match', function(){
      sut.dispatch(socket, "aMatch");
      expect(sut.execute).toHaveBeenCalledWith(socket, "a");
    });
  });

  describe('execute', function () {
    let room;
    let autocompleteResult;
    let shortDir;

    beforeEach(function () {
      room = mocks.getMockRoom();
      spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
      spyOn(Room, 'getById').and.callFake(() => room);
      shortDir = 'n';
      spyOn(Room, 'oppositeDirection').and.callFake(() => 'opposite');
      spyOn(Room, 'shortToLong').and.callFake(() => 'exit name');
      spyOn(Room, 'validDirectionInput').and.callFake(() => shortDir);
      spyOn(breakCommand, 'execute').and.callFake(() => { });
      spyOn(lookCommand, 'execute').and.callFake(() => {});
      socket.emit.calls.reset();
      socket.broadcast.to().emit.calls.reset();
    });

    it('should output message when direction is up and there is no exit', function(){
      shortDir = 'u';
      var exitIndex = room.exits.findIndex(e => e.dir === 'u');
      room.exits.splice(exitIndex, 1);

      sut.execute(socket, shortDir);

      expect(socket.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the ceiling.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    it('should output message when direction is down and there is no exit', function(){
      shortDir = 'd';
      var exitIndex = room.exits.findIndex(e => e.dir === 'd');
      room.exits.splice(exitIndex, 1);

      sut.execute(socket, shortDir);
      
      expect(socket.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the floor.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    it('should output message when direction is not up or down and there is no exit', function(){
      shortDir = 'zzz';
      sut.execute(socket, shortDir);
      
      expect(socket.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the wall to the exit name.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });
   
    it('should output message when direction is up and there is a closed exit', function(){
      shortDir = 'u';
      let exitIndex = room.exits.findIndex(e => e.dir === 'u');
      room.exits[exitIndex].closed = true;
      sut.execute(socket, shortDir);
      
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the closed door above.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    it('should output message when direction is down and there is a closed exit', function(){
      shortDir = 'd';
      let exitIndex = room.exits.findIndex(e => e.dir === 'd');
      room.exits[exitIndex].closed = true;
      sut.execute(socket, shortDir);
      
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the trapdoor on the floor.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    it('should output message when direction is not up or down and there is a closed exit', function(){
      shortDir = 'w';
      let exitIndex = room.exits.findIndex(e => e.dir === 'w');
      room.exits[exitIndex].closed = true;
      sut.execute(socket, shortDir);
      
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the door to the exit name.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">The door in that direction is not open!</span>' });
    });

    it('should output message when room is not found', function(){
      room = undefined;
      shortDir = 'u';
      sut.execute(socket, shortDir);

      expect(socket.to().emit).toHaveBeenCalledWith('output', { message: `<span class="silver">${socket.user.username} runs into the ceiling.</span>` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="yellow">There is no exit in that direction!</span>' });
    });

    xit('should process movement when direction is up', function(){
      shortDir = 'u';
      var exitIndex = room.exits.findIndex(e => e.dir === 'u');
      room.exits[exitIndex].closed = false;

      sut.execute(socket, shortDir);

      expect(breakCommand.execute).toHaveBeenCalledWith(socket);
      expect(socket.broadcast.to().emit.calls.first().args).toEqual(['output', { message: `${socket.user.username} has gone above.` }])
      expect(socket.broadcast.to().emit.calls.any().args).toEqual(['output', { message:  'You hear movement from below.' }]);
      expect(socket.broadcast.to().emit.calls.mostRecent().args).toEqual(['output', {message: `${socket.user.username} has entered from below.`}]);
      expect(socket.leave).toHaveBeenCalledWith(room.id);
      expect(socket.user.save).toHaveBeenCalled();
      var exit = room.exits.find(e => e.dir === shortDir);
      expect(socket.join).toHaveBeenCalledWith(exit.roomId);
    });
    /*

    it('should output messages when direction is invalid', function() {
    });

    it('should output messages when direction has closed door', function() {
    });
    
    it('should be successful when direction has open door', function() {
    });

    it('should emit movement sounds to adjacent rooms on successful move', function() {

    });

    it('should output messages on successful move', function() {

    });

    it('should break off combat on successful move', function() {

    });

    it('should update user object and database on successful move', function() {

    });
    */
  });
});