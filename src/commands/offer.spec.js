'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');


let mockTargetSocket;
let autocompleteResult;
let usersInRoomResult = [];
let mockRoom = mocks.getMockRoom();
mockRoom.usersInRoom = jasmine.createSpy('usersInRoomSpy').and.callFake(() => usersInRoomResult);
const sut = SandboxedModule.require('./offer', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {
      getById: () => mockRoom,
    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockTargetSocket,
      'usersInRoom': () => usersInRoomResult,
    },
  },
});

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
    usersInRoomResult = ['TestUser', 'aUser'];

    beforeEach(function () {
      mockTargetSocket = new mocks.SocketMock();
      socket.user.inventory = [{ id: 'aItemId', name: 'aItem' }];
      socket.user.username = 'TestUser';
      socket.emit.calls.reset();
    });

    it('should return when item is not in inventory', function () {
      autocompleteResult = null;

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).not.toHaveBeenCalled();
    });

    it('should output message when user is not in room', function () {
      autocompleteResult = [{ id: 'aItemId', name: 'aItem' }];
      usersInRoomResult = ['TestUser'];

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'aUser is not here!' });
    });

    it('should output message when multiple users match', function () {
      autocompleteResult = [{ id: 'aItemId', name: 'aItem' }];
      usersInRoomResult = ['TestUser', 'aUser', 'aUser'];

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: '\'aUser\' is a common name here. Be more specific.' });
    });

    it('should output message if user socket is not found', function () {
      autocompleteResult = [{ id: 'aItemId', name: 'aItem' }];
      usersInRoomResult = ['TestUser', 'aUser'];

      mockTargetSocket = undefined;

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'aUser is not here!' });
    });

    it('should add offer to other user socket offers collection if offers collection is undefined', function () {
      autocompleteResult = { id: 'aItemId', name: 'aItem' };
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [{ id: 'aItemId', name: 'aItem' }],
      };
      mockTargetSocket.offers = undefined;
      let expectedOffers = [{
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult,
      }];

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers).toEqual(expectedOffers);
      expect(mockTargetSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    it('should add offer to other user socket offers collection if offers collection is empty', function () {
      autocompleteResult = { id: 'aItemId', name: 'aItem' };
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [{ id: 'aItemId', name: 'aItem' }],
      };
      mockTargetSocket.offers = [];
      let expectedOffers = [{
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult,
      }];

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers).toEqual(expectedOffers);
      expect(mockTargetSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    it('should overwrite offer to other user socket offers collection if same offer item exists', function () {
      autocompleteResult = { id: 'aItemId', name: 'aItem' };
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [{ id: 'aItemId', name: 'aItem' }],
      };

      let existingOffer = {
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: { id: 'aItemId', name: 'differentItem' },
      };

      mockTargetSocket.offers = [existingOffer];

      let expectedOffers = [{
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: autocompleteResult,
      }];

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers).toEqual(expectedOffers);
      expect(mockTargetSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    it('should add offer to other user socket offers collection if existing offers exist', function () {
      autocompleteResult = { id: 'aItemId', name: 'aItem' };
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [{ id: 'aItemId', name: 'aItem' }],
      };

      let existingOffer = {
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: { id: 'aDifferentItemId', name: 'aDifferentItem' },
      };

      mockTargetSocket.offers = [existingOffer];

      let expectedOffers = [
        existingOffer, {
          fromUserName: socket.user.username,
          toUserName: 'aUser',
          item: autocompleteResult,
        }];

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers).toEqual(expectedOffers);
      expect(mockTargetSocket.emit).toHaveBeenCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    it('should remove offer if it is not taken before the timeout', function () {

      autocompleteResult = { id: 'aItemId', name: 'aItem' };
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [{ id: 'aItemId', name: 'aItem' }],
      };

      sut.execute(socket, 'aUser', 'aItem', function () {
        expect(mockTargetSocket.offers.length).toEqual(0);
      });
    });
  });

  describe('help', function () {
    it('should output message', function () {
      sut.help(socket);

      const output = '<span class="mediumOrchid">offer &lt;item&gt; &lt;player&gt; </span><span class="purple">-</span> Offer an item to a player.<br />';

      expect(socket.emit).toHaveBeenCalledWith('output', { message: output });
    });
  });
});
