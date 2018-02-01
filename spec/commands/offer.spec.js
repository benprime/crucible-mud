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
    let otherUserSocket;

    beforeEach(function(){
      spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
      spyOn(Room, 'getById').and.returnValue(room);
      otherUserSocket = new mocks.SocketMock();
      spyOn(global, 'GetSocketByUsername').and.callFake(() => otherUserSocket);
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
      usersInRoom = ['TestUser'];

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `aUser is not here!` });
    });

    it('should output message when multiple users match', function() {
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser', 'aUser'];

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `'aUser' is a common name here. Be more specific.` });
    });

    it('should output message if user socket is not found', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      otherUserSocket = undefined;

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `aUser is not here!`});
    });

    it('should add offer to other user socket offers collection if offers collection is undefined', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      socket.user = { 
        username: 'TestUser',
        inventory: [{id: 'aItemId', name:'aItem'}]
      };
      otherUserSocket.offers = undefined;
      let expectedOffers = [{ 
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult[0]
      }];
      
      sut.execute(socket, 'aUser', 'aItem');

      expect(otherUserSocket.offers).toEqual(expectedOffers);
      expect(otherUserSocket.emit).toHaveBeenCalledWith('output', { message: `TestUser offered you a aItem.` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You offered a aItem to aUser.` });
    });

    it('should add offer to other user socket offers collection if offers collection is empty', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      socket.user = { 
        username: 'TestUser',
        inventory: [{id: 'aItemId', name:'aItem'}]
      };
      otherUserSocket.offers = [];
      let expectedOffers = [{ 
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult[0]
      }];
      
      sut.execute(socket, 'aUser', 'aItem');
      expect(otherUserSocket.offers).toEqual(expectedOffers);
      expect(otherUserSocket.emit).toHaveBeenCalledWith('output', { message: `TestUser offered you a aItem.` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You offered a aItem to aUser.` });
    });

    it('should overwrite offer to other user socket offers collection if same offer item exists', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      socket.user = { 
        username: 'TestUser',
        inventory: [{id: 'aItemId', name:'aItem'}]
      };

      let existingOffer = { 
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: {id: 'aItemId', name:'differentItem'}
      };

      otherUserSocket.offers = [existingOffer];

      let expectedOffers = [{
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult[0]
      }];
      
      sut.execute(socket, 'aUser', 'aItem');
      expect(otherUserSocket.offers).toEqual(expectedOffers);
      expect(otherUserSocket.emit).toHaveBeenCalledWith('output', { message: `TestUser offered you a aItem.` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You offered a aItem to aUser.` });
    });

    it('should add offer to other user socket offers collection if existing offers exist', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      socket.user = { 
        username: 'TestUser',
        inventory: [{id: 'aItemId', name:'aItem'}]
      };

      let existingOffer = { 
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: {id: 'aDifferentItemId', name:'aDifferentItem'}
      };

      otherUserSocket.offers = [existingOffer];

      let expectedOffers = [
        existingOffer, {
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult[0]
      }];
      
      sut.execute(socket, 'aUser', 'aItem');
      expect(otherUserSocket.offers).toEqual(expectedOffers);
      expect(otherUserSocket.emit).toHaveBeenCalledWith('output', { message: `TestUser offered you a aItem.` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You offered a aItem to aUser.` });
    });

    it('should add offer to other user socket offers collection if existing offers exist', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      socket.user = { 
        username: 'TestUser',
        inventory: [{id: 'aItemId', name:'aItem'}]
      };

      let existingOffer = { 
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: {id: 'aDifferentItemId', name:'aDifferentItem'}
      };

      otherUserSocket.offers = [existingOffer];

      let expectedOffers = [
        existingOffer, {
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult[0]
      }];
      
      sut.execute(socket, 'aUser', 'aItem');
      expect(otherUserSocket.offers).toEqual(expectedOffers);
      expect(otherUserSocket.emit).toHaveBeenCalledWith('output', { message: `TestUser offered you a aItem.` });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `You offered a aItem to aUser.` });
    });

    it('should remove offer if it is not taken before the timeout', function(){
      autocompleteResult = [{id: 'aItemId', name:'aItem'}];
      usersInRoom = ['TestUser', 'aUser'];

      socket.user = { 
        username: 'TestUser',
        inventory: [{id: 'aItemId', name:'aItem'}]
      };

      // Install the clock so we can mock setting the ticks ahead
      jasmine.clock().install();
      
      sut.execute(socket, 'aUser', 'aItem');
      expect(otherUserSocket.offers.length).toEqual(1);

      // Set the clock ahead to trigger the timeout
      jasmine.clock().tick(600001);

      expect(otherUserSocket.offers.length).toEqual(0);

      jasmine.clock().uninstall();
    });
  });

  describe('help', function(){
    it('should output message', function(){
      sut.help(socket);

      const output = '<span class="mediumOrchid">offer &lt;item&gt; &lt;player&gt; </span><span class="purple">-</span> Offer an item to a player.<br />';
      expect(socket.emit).toHaveBeenCalledWith('output', { message: output });
    });
  });
});