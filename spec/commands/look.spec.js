'use strict';

const mocks = require('../mocks');
const Room = require('../../models/room');
const sut = require('../../commands/look');
const autocomplete = require('../../autocomplete');
const roomManager = require('../../roomManager');

describe('look', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch triggers execute', function(){
    let executeSpy;

    beforeAll(function() {
        executeSpy = spyOn(sut, 'execute');
    });

    afterAll(function(){
        executeSpy.and.callThrough();
    });
    
    it('on short pattern', function(){
        sut.dispatch(socket, ['']);
        expect(executeSpy).toHaveBeenCalledWith(socket, true, null);
    });

    it('on long pattern', function(){
      let lookTarget = 'look_target';
      sut.dispatch(socket, ['l', lookTarget]);
      expect(executeSpy).toHaveBeenCalledWith(socket, false, lookTarget);
    });
  });

  describe('execute', function () {
    let room;
    let autocompleteResult;
    let autocompleteSpy;
    let roomManagerSpy;
    let shortDir;
    let isValidDirection = true;

    beforeEach(function(){
      room = mocks.getMockRoom();
      autocompleteSpy = spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
      roomManagerSpy = spyOn(roomManager, 'getRoomById').and.callFake(() => room);
      shortDir = 'someDir';
      spyOn(Room, 'oppositeDirection').and.callFake(() => 'opposite');
      spyOn(Room, 'exitName').and.callFake(() => 'exit name');
      spyOn(global, 'LongToShort').and.callFake(() => shortDir);
      spyOn(global, 'ValidDirectionInput').and.callFake(() => isValidDirection);
    });

    it('should output short room look when short param is true', function () {
      sut.execute(socket, true);
      
      expect(room.Look).toHaveBeenCalledWith(socket, true);
    });

    it('should output room look when lookTarget is not passed', function () {
      sut.execute(socket, false);

      expect(room.Look).toHaveBeenCalledWith(socket, false);
    });

    it('should output room look when lookTarget is a direction', function () {
      room.exits.push({
        closed: false,
        dir: shortDir
      });

      sut.execute(socket, false, shortDir);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You look to the exit name...` });
      expect(socket.broadcast.to().emit).toHaveBeenCalledWith('output', { message: `<span class="yellow">${socket.user.username} peaks in from the exit name.</span>` });
      expect(room.Look).toHaveBeenCalledWith(socket, false);
    });

    it('should output a message when lookTarget is a direction with a closed door', function () {
      shortDir = 'closedDir';
      room.exits.push({
        closed: true,
        dir: shortDir
      });
      sut.execute(socket, false, shortDir);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'The door in that direction is closed!' });
    });

    it('should output item look when lookTarget is an inventory item', function () {
      isValidDirection = false;
      autocompleteResult = undefined;

      sut.execute(socket, false, 'someObj');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here!' });
    });

    it('should output mob look when lookTarget is a valid autocomplete result', function () {
      isValidDirection = false;
      autocompleteResult = {
        Look: jasmine.createSpy('objectLook').and.callFake(() => {})
      }

      sut.execute(socket, false, 'someObj');
      
      expect(autocompleteResult.Look).toHaveBeenCalledWith(socket);
    });
  });
  
  it('help should output message', function(){
    sut.help(socket);

    let output = '';
    output += '<span class="mediumOrchid">l <span class="purple">|</span> look </span><span class="purple">-</span> Display info about current room.<br />';
    output += '<span class="mediumOrchid">look &lt;item/mob name&gt; </span><span class="purple">-</span> Display detailed info about &lt;item/mob&gt;.<br />';

    expect(socket.emit).toHaveBeenCalledWith('output', { message: output });
  });
});