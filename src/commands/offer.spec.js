import { mockGetRoomById } from '../models/room';
import Item from '../models/item';
import { mockCharacterInRoom, mockGetSocketByCharacterId } from '../core/socketUtil';
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
    jest.resetAllMocks();
  });

  // describe('dispatch', () => {
  //   beforeAll(() => {
  //     jest.spyOn(sut, 'execute');
  //   });

  //   test('should call execute with match', () => {
  //     sut.dispatch(socket, ['offer', 'aUser', 'aItem']);

  //     expect(sut.execute).toBeCalledWith(socket.character, 'aUser', 'aItem');
  //   });

  //   afterAll(() => {
  //     sut.execute.mockRestore();
  //   });
  // });

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

      sut.execute(socket.character, 'aItem', 'aUser');

      //expect(socket.emit).not.toHaveBeenCalled();
    });

    test('should output message when user is not in room', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: mockTargetSocket.user }).mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser'];
      mockCharacterInRoom.mockReturnValueOnce(undefined);

      sut.execute(socket.character, 'aItem', 'aUser');

      //expect(socket.emit).toBeCalledWith('output', { message: 'aUser is not here!' });
    });

    test('should output message if user socket is not found', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item }).mockReturnValueOnce(undefined);
      usersInRoomResult = ['TestUser', 'aUser'];

      sut.execute(socket.character, 'aItem', 'aUser');

      //expect(socket.emit).not.toBeCalled();
    });

    test('should add offer to other user socket offers collection if offers collection is empty', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: mockTargetSocket.user }).mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];
      socket.character.inventory = [item];

      mockTargetSocket.character.offers = [];
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket.character);


      let expectedOffer = {
        fromUserName: socket.character.name,
        toUserName: 'aUser',
        item: item,
      };

      sut.execute(socket.character, 'aItem', 'aUser');

      expect(mockTargetSocket.character.offers[0]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
      expect(mockTargetSocket.character.offers[0]).toHaveProperty('toUserName', expectedOffer.toUserName);
      expect(mockTargetSocket.character.offers[0].item.id).toBe(expectedOffer.item.id);

      //expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser' });
      //expect(socket.emit).toBeCalledWith('output', { message: 'You offer your aItem to aUser.' });
    });

    test('should overwrite offer to other user socket offers collection if same offer item exists', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: mockTargetSocket.user }).mockReturnValueOnce({ item: item });
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket.character);
      usersInRoomResult = ['TestUser', 'TestUser2', 'aUser'];

      socket.user = {
        username: 'TestUser',
        inventory: [item],
      };

      let existingItem = new Item({ name: 'differentItem' });
      let existingOffer = {
        fromUserName: 'TestUser2',
        toUserName: 'aUser',
        item: existingItem,
      };

      mockTargetSocket.character.offers = [existingOffer];

      let expectedOffer = {
        fromUserName: socket.character.name,
        toUserName: 'aUser',
        item: item,
      };

      sut.execute(socket.character, 'aItem', 'aUser');

      expect(mockTargetSocket.character.offers).toHaveLength(2);

      expect(mockTargetSocket.character.offers[0]).toHaveProperty('fromUserName', existingOffer.fromUserName);
      expect(mockTargetSocket.character.offers[0]).toHaveProperty('toUserName', 'aUser');
      expect(mockTargetSocket.character.offers[0].item.id).toBe(existingItem.id);

      expect(mockTargetSocket.character.offers[1]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
      expect(mockTargetSocket.character.offers[1]).toHaveProperty('toUserName', expectedOffer.toUserName);
      expect(mockTargetSocket.character.offers[1].item.id).toBe(expectedOffer.item.id);

      //expect(mockTargetSocket.character.offers[1]).toMatchObject(expectedOffers);
      //expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser' });
      //expect(socket.emit).toBeCalledWith('output', { message: 'You offer your aItem to aUser.' });
    });

    test('should add offer to other user socket offers collection if existing offers exist', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: mockTargetSocket.user }).mockReturnValueOnce({ item: item });
      mockCharacterInRoom.mockReturnValueOnce(mockTargetSocket.character);
      mockGetSocketByCharacterId.mockReturnValueOnce(socket);
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.character.name = 'TestUser';
      socket.inventory = [item];

      let existingItem = new Item({ name: 'aDifferentItem' });

      let existingOffer = {
        fromUserName: 'TestUser2',
        toUserName: 'aUser',
        item: existingItem,
      };

      mockTargetSocket.character.offers = [existingOffer];

      sut.execute(socket.character, item.name, 'aUser');

      expect(mockTargetSocket.character.offers).toHaveLength(2);

      expect(mockTargetSocket.character.offers[0].fromUserName).toBe(existingOffer.fromUserName);
      expect(mockTargetSocket.character.offers[0].toUserName).toBe('aUser');
      expect(mockTargetSocket.character.offers[0].item).toBe(existingItem);

      expect(mockTargetSocket.character.offers[1].fromUserName).toBe(socket.character.name);
      expect(mockTargetSocket.character.offers[1].toUserName).toBe('aUser');
      expect(mockTargetSocket.character.offers[1].item.id).toBe(item.id);

      //expect(mockTargetSocket.emit).toBeCalledWith('output', { message: 'TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser' });
      //expect(socket.emit).toBeCalledWith('output', { message: 'You offer your aItem to aUser.' });
    });

    test('should remove offer if it is not taken before the timeout', () => {
      mockAutocompleteTypes.mockReturnValueOnce({ item: item });
      usersInRoomResult = ['TestUser', 'aUser'];

      socket.user.username = 'TestUser';
      socket.inventory = [item];


      sut.execute(socket.character, 'aUser', 'aItem', () => {
        expect(mockTargetSocket.character.offers).toHaveLength(0);
      });
    });
  });

  describe('help', () => {
    test('should output message', () => {
      sut.help(socket);

      const output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br /><span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';

      expect(socket.emit).toBeCalledWith('output', { message: output });
    });
  });
});
