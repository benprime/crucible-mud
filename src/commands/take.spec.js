'use strict';

const mocks = require('../../spec/mocks');
const SandboxedModule = require('sandboxed-module');
const Item = require('../models/item');
const ObjectId = require('mongodb').ObjectId;

let mockGlobalIO = new mocks.IOMock();
let mockReturnSocket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
let autocompleteResult = {};
const sut = SandboxedModule.require('./take', {
  requires: {
    '../core/autocomplete': {
      autocompleteTypes: jasmine.createSpy('autocompleteTypesSpy').and.callFake(() => autocompleteResult),
    },
    '../models/room': {
      getById: jasmine.createSpy('getByIdSpy').and.callFake(() => mockRoom),
    },
    '../core/socketUtil': {
      'getSocketByUsername': () => mockReturnSocket,
    },
  },
  globals: { io: mockGlobalIO },
});

describe('take', () => {

  describe('dispatch', () => {
    beforeEach(() => {
      mockReturnSocket = new mocks.SocketMock();
      spyOn(sut, 'execute');
      mockReturnSocket.emit.calls.reset();
    });

    it('should call execute with match', () => {
      sut.dispatch(mockReturnSocket, ['take', 'aItem']);

      expect(sut.execute).toHaveBeenCalledWith(mockReturnSocket, 'aItem');
    });

    it('should output message if multiple matches', () => {
      sut.dispatch(mockReturnSocket, 'take', 'aItem', 'anotherItem');

      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: 'What do you want to take?' });
    });
  });

  describe('execute', () => {

    afterEach(() => {
      mockReturnSocket.emit.calls.reset();
      mockReturnSocket.user.save.calls.reset();
    });

    it('should update from/to inventory on successful offer/take', () => {
      let socket = new mocks.SocketMock();

      let offeredItem = new Item();
      offeredItem._id = new ObjectId();
      offeredItem.name = 'aItem';
      offeredItem.displayName = 'aItem display name';

      mockReturnSocket.user.username = 'aUser';
      mockReturnSocket.user.inventory = [offeredItem];

      socket.offers = [{
        fromUserName: 'aUser',
        toUserName: 'TestUser',
        item: offeredItem,
      }];

      sut.execute(socket, 'aItem');

      expect(socket.offers.length).toEqual(0);
      expect(socket.user.inventory.length).toEqual(1);
      expect(socket.user.inventory[0].name).toEqual('aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `${offeredItem.displayName} was added to your inventory.` });
      expect(socket.user.save).toHaveBeenCalled();
      expect(mockReturnSocket.user.inventory.length).toEqual(0);
      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: `${offeredItem.displayName} was removed from your inventory.` });
      expect(mockReturnSocket.user.save).toHaveBeenCalled();
    });

    it('should output message when item is not found', () => {
      mockRoom.save.calls.reset();
      autocompleteResult = null;

      sut.execute(mockReturnSocket, 'itemNotThere');

      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: 'You don\'t see that here!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(mockReturnSocket.user.save).not.toHaveBeenCalled();
    });

    it('should output message when item is fixed', () => {
      mockRoom.save.calls.reset();
      mockReturnSocket.user.inventory.length = 0;

      autocompleteResult = {
        id: 'aItemId',
        name: 'aItem',
        displayName: 'aItem display name',
        fixed: true,
      };

      sut.execute(mockReturnSocket, 'aItem');

      expect(mockReturnSocket.user.inventory.length).toEqual(0);
      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: 'You cannot take that!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(mockReturnSocket.user.save).not.toHaveBeenCalled();
    });

    it('should update the room/user and save room/user to database', () => {
      autocompleteResult = {
        id: 'aItemId',
        name: 'aItem',
        displayName: 'aItem display name',
      };

      sut.execute(mockReturnSocket, 'aItem');

      expect(mockRoom.inventory.includes(autocompleteResult)).toBeFalsy();
      expect(mockReturnSocket.user.inventory[0].name).toEqual('aItem');
      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: `${autocompleteResult.displayName} was added to your inventory.` });
      expect(mockReturnSocket.user.save).toHaveBeenCalled();
      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: `${autocompleteResult.displayName} taken.` });
      expect(mockReturnSocket.broadcast.to(mockReturnSocket.user.roomId).emit).toHaveBeenCalledWith('output', { message: `${mockReturnSocket.user.username} takes ${autocompleteResult.displayName}.` });
    });
  });

  describe('help', () => {
    it('outputs message', () => {
      sut.help(mockReturnSocket);

      expect(mockReturnSocket.emit).toHaveBeenCalledWith('output', { message: '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />' });
    });
  });
});
