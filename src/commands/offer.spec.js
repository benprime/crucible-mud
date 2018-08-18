import { mockGetRoomById } from '../models/room';
import Item from '../models/item';
import { mockGetSocketByUsername } from '../core/socketUtil';
import { mockAutocompleteTypes } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './offer';


jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

let mockTargetSocket;
let usersInRoomResult = [];
let mockRoom = mocks.getMockRoom();
mockRoom.usersInRoom = jest.fn(() => usersInRoomResult).mockName('usersInRoomSpy');
mockGetRoomById.mockReturnValue(mockRoom);
global.io = new mocks.IOMock();

describe('offer', () => {
  let socket;
  let item = new Item({ name: 'aItem' });

  beforeAll(() => {
    socket = new mocks.SocketMock();
  });

  beforeEach(() => {
    //socket.offers = [];
  });

  describe('dispatch', () => {
    beforeAll(() => {
      jest.spyOn(sut, 'execute');
    });

    test('should call execute with match', () => {
      sut.dispatch(socket, ['offer', 'aUser', 'aItem']);

      expect(sut.execute).toBeCalledWith(socket, 'aUser', 'aItem');
    });

    afterAll(() => {
      sut.execute.mockRestore();
    });
  });

  describe('execute', () => {
    usersInRoomResult = ['TestUser', 'aUser'];

    beforeEach(() => {
      mockTargetSocket = new mocks.SocketMock();
      socket.character.inventory = [item];
      socket.user.username = 'TestUser';
      socket.emit.mockClear();
    });

    test('should return when item is not in inventory', () => {
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).not.toHaveBeenCalled();
    });

    test('should output message when user is not in room', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser'];

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).toBeCalledWith('output', { message: 'aUser is not here!' });
    });

    test('should output message when multiple users match', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser', 'aUser'];

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).toBeCalledWith('output', { message: '\'aUser\' is a common name here. Be more specific.' });
    });

    test('should output message if user socket is not found', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];

      mockTargetSocket = undefined;

      sut.execute(socket, 'aUser', 'aItem');

      expect(socket.emit).toBeCalledWith('output', { message: 'aUser is not here!' });
    });

    test('should add offer to other user socket offers collection if offers collection is undefined', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [item],
      };
      mockTargetSocket.offers = undefined;
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);
      let expectedOffer = {
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: item,
      };

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers[0]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
      expect(mockTargetSocket.offers[0]).toHaveProperty('toUserName', expectedOffer.toUserName);
      expect(mockTargetSocket.offers[0].item.id).toBe(expectedOffer.item.id);

      expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toBeCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    test('should add offer to other user socket offers collection if offers collection is empty', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];
      socket.character.inventory = [item];

      mockTargetSocket.offers = [];
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);

      let expectedOffer = {
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: item,
      };

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers[0]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
      expect(mockTargetSocket.offers[0]).toHaveProperty('toUserName', expectedOffer.toUserName);
      expect(mockTargetSocket.offers[0].item.id).toBe(expectedOffer.item.id);

      expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toBeCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    test('should overwrite offer to other user socket offers collection if same offer item exists', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [item],
      };

      let existingItem = new Item({ name: 'differentItem' });
      let existingOffer = {
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: existingItem,
      };

      mockTargetSocket.offers = [existingOffer];
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);

      let expectedOffer = {
        fromUserName: socket.user.username,
        toUserName: 'aUser',
        item: item,
      };

      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers[0]).toHaveProperty('fromUserName', socket.user.username);
      expect(mockTargetSocket.offers[0]).toHaveProperty('toUserName', 'aUser');
      expect(mockTargetSocket.offers[0].item.id).toBe(existingItem.id);

      expect(mockTargetSocket.offers[1]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
      expect(mockTargetSocket.offers[1]).toHaveProperty('toUserName', expectedOffer.toUserName);
      expect(mockTargetSocket.offers[1].item.id).toBe(expectedOffer.item.id);

      //expect(mockTargetSocket.offers[1]).toMatchObject(expectedOffers);
      expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toBeCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    test('should add offer to other user socket offers collection if existing offers exist', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [item],
      };

      let existingItem = new Item({ name: 'aDifferentItem' });

      let existingOffer = {
        fromUserName: 'TestUser',
        toUserName: 'aUser',
        item: existingItem,
      };

      mockTargetSocket.offers = [existingOffer];
      mockGetSocketByUsername.mockReturnValueOnce(mockTargetSocket);


      sut.execute(socket, 'aUser', 'aItem');

      expect(mockTargetSocket.offers).toHaveLength(2);

      expect(mockTargetSocket.offers[0].fromUserName).toBe(socket.user.username);
      expect(mockTargetSocket.offers[0].toUserName).toBe('aUser');
      expect(mockTargetSocket.offers[0].item).toBe(existingItem);

      expect(mockTargetSocket.offers[1].fromUserName).toBe(socket.user.username);
      expect(mockTargetSocket.offers[1].toUserName).toBe('aUser');
      expect(mockTargetSocket.offers[1].item.id).toBe(item.id);

      expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offered you a aItem.' });
      expect(socket.emit).toBeCalledWith('output', { message: 'You offered a aItem to aUser.' });
    });

    test('should remove offer if it is not taken before the timeout', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [item],
      };

      sut.execute(socket, 'aUser', 'aItem', () => {
        expect(mockTargetSocket.offers).toHaveLength(0);
      });
    });
  });

  describe('help', () => {
    test('should output message', () => {
      sut.help(socket);

      const output = '<span class="mediumOrchid">offer &lt;item&gt; &lt;player&gt; </span><span class="purple">-</span> Offer an item to a player.<br />';

      expect(socket.emit).toBeCalledWith('output', { message: output });
    });
  });
});
