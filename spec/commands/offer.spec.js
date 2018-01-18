'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/offer');
const autocomplete = require('../../autocomplete');
const Room = require('../../models/room');

describe('offer', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch', function () {
    beforeEach(function () {
      spyOn(sut, 'execute');
    });

    it('should call execute with match', function () {
      sut.dispatch(socket, ['offer', 'aUser', 'aItem']);
      expect(sut.execute).toHaveBeenCalledWith(socket, 'aUser', 'aItem');
    });
  });

  describe('execute', function () {
    let autocompleteResult;
    let usersInRoom = ['TestUser', 'aUser'];
    let room = mocks.getMockRoom();

    beforeEach(function(){
      spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
      spyOn(Room, 'getById').and.returnValue(room);
      spyOn(global, 'GetSocketByUsername').and.callFake(() => socket);
      socket.user.inventory = [{id: 'aItemId', name: 'aItem'}];
      socket.user.username = 'TestUser';
      room.usersInRoom.and.callFake(() => usersInRoom);
      socket.emit.calls.reset();
    });

    it('should output message when item is not in inventory', function() {
      autocompleteResult = [];

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `aItem is not in your inventory!` });
    });

    it('should output message when multiple items are in inventory', function() {
      autocompleteResult = [{id: 'aItemId', name:'aItem'}, {id: 'anotherItemId', name:'aItem'}];

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `Many items can be described as 'aItem'. Be more specific.` });
    });

    it('should output message when user is not in room', function() {
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser', 'aUser']

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `'aUser' is a common name here. Be more specific.` });
    });
  });
});