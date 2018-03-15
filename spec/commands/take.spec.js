'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/take');
const autocomplete = require('../../autocomplete');
const Room = require('../../models/room');

describe('take', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch', function(){
    beforeEach(function(){
      spyOn(sut, 'execute');
      socket.emit.calls.reset();
    });

    it('should call execute with match', function(){
      sut.dispatch(socket, ['take', 'aItem']);
      expect(sut.execute).toHaveBeenCalledWith(socket, 'aItem');
    });

    it('should output message if multiple matches', function(){
      sut.dispatch(socket, 'take', 'aItem', 'anotherItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'What do you want to take?' });
    });
  });
  
  describe('execute', function () {
    let otherUserSocket = new mocks.SocketMock();
    let room = mocks.getMockRoom();
    let autocompleteResult;
    
    beforeEach(function(){
      spyOn(global, 'GetSocketByUsername').and.returnValue(otherUserSocket);
      spyOn(Room, 'getById').and.callFake(() => room);
      spyOn(autocomplete, 'autocompleteTypes').and.callFake(() => autocompleteResult);
      spyOn(room.inventory, 'remove').and.callFake(() => {});
    });

    afterEach(function (){
      socket.emit.calls.reset();
      socket.user.save.calls.reset();
    });

    it('should add offered item to inventory', function(){
      let offeredItem = {id: 'aItemId', name:'aItem', displayName:'aItem display name'};
      otherUserSocket.user.inventory = [offeredItem];
      socket.offers = [{
        fromUserName: 'aUser',
        toUserName: 'TestUser',
        item: offeredItem,
      }];

      sut.execute(socket, 'aItem');

      expect(socket.user.inventory[0].name).toEqual('aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', {message: `${offeredItem.displayName} was added to your inventory.`});
      expect(socket.user.save).toHaveBeenCalled();
      expect(otherUserSocket.user.inventory.length).toEqual(0);
      expect(otherUserSocket.emit).toHaveBeenCalledWith('output', { message: `${offeredItem.displayName} was removed from your inventory.` });
      expect(otherUserSocket.user.save).toHaveBeenCalled();
      expect(socket.offers.length).toEqual(0);
    });

    it('should output message when item is not found', function() {
      autocompleteResult =  null;

      sut.execute(socket, 'itemNotThere');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here!' });
      expect(Room.getById).not.toHaveBeenCalled();
      expect(room.save).not.toHaveBeenCalled();
      expect(socket.user.save).not.toHaveBeenCalled();
    });

    it('should output message when item is fixed', function() {
      autocompleteResult =  { 
        id: 'aItemId', 
        name: 'aItem', 
        displayName: 'aItem display name', 
        fixed: true };

      sut.execute(socket, 'aItem');

      expect(socket.user.inventory[0].name).toEqual('aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', {message: 'You cannot take that!'});
      expect(Room.getById).not.toHaveBeenCalled();
      expect(room.save).not.toHaveBeenCalled();
      expect(socket.user.save).not.toHaveBeenCalled();
    });

    it('should update the room/user and save room/user to database', function() {
      autocompleteResult = {
        id: 'aItemId', 
        name: 'aItem', 
        displayName: 'aItem display name', 
      };

      sut.execute(socket, 'aItem');

      expect(room.inventory.remove).toHaveBeenCalledWith(autocompleteResult);
      expect(socket.user.inventory[0].name).toEqual('aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', {message: `${autocompleteResult.displayName} was added to your inventory.`});
      expect(socket.user.save).toHaveBeenCalled();
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `${autocompleteResult.displayName} taken.` });
      expect(socket.broadcast.to(socket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `${socket.user.username} takes ${autocompleteResult.displayName}.` });
    });
  });

  describe('help', function(){
    it('outputs message', function(){
      sut.help(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />' });
    });
  });
});