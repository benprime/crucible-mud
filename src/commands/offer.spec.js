import { mockGetRoomById } from '../models/room';
import Item from '../models/item';
import { mockGetSocketByCharacterId } from '../core/socketUtil';
import { mockAutocompleteMultiple, mockAutocompleteCharacter } from '../core/autocomplete';
import mocks from '../../spec/mocks';
import sut from './offer';

//jest.mock('../core/dayCycle');
jest.mock('../config');
jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

let mockTargetSocket;
let getCharacterNamesResult = [];
let mockRoom = mocks.getMockRoom();
mockRoom.getCharacterNames = jest.fn(() => getCharacterNamesResult).mockName('getCharacterNamesSpy');
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
    getCharacterNamesResult = ['TestUser', 'aUser'];

    beforeEach(() => {
      mockTargetSocket = new mocks.SocketMock();
      mockTargetSocket.character.roomId = socket.character.roomId;
      socket.character.inventory = [item];
      socket.character.name = 'TestUser';
      socket.emit.mockClear();
    });

    test('should return when item is not in inventory', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce(null);
      expect.assertions(1);

      return sut.execute(socket.character, 'aItem', 'aUser').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('You don\'t seem to be carrying that.');
      });

    });

    test('should output message when user is not in room', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      mockTargetSocket.character.roomId = 'a different room';
      expect.assertions(1);

      return sut.execute(socket.character, 'aItem', 'aUser').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('aUser is not here!');
      });

    });

    test('should output message if user socket is not found', () => {
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item }).mockReturnValueOnce(undefined);
      expect.assertions(1);

      return sut.execute(socket.character, 'aItem', 'aUser').catch(() => {
        expect(socket.character.output).toHaveBeenCalledWith('Unknown user or user not connected.');
      });

    });

    test('should add offer to other user socket offers collection if offers collection is empty', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      socket.character.inventory = [item];
      mockTargetSocket.character.offers = [];

      let expectedOffer = {
        fromUserName: socket.character.name,
        toUserName: 'aUser',
        item: item,
      };
      expect.assertions(5);

      return sut.execute(socket.character, 'aItem', 'aUser').then(() => {
        expect(mockTargetSocket.character.offers[0]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
        expect(mockTargetSocket.character.offers[0]).toHaveProperty('toUserName', expectedOffer.toUserName);
        expect(mockTargetSocket.character.offers[0].item.id).toBe(expectedOffer.item.id);
        expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser');
        expect(socket.character.output).toHaveBeenCalledWith('You offer your aItem to aUser.');
      });

    });

    test('should overwrite offer to other user socket offers collection if same offer item exists', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });

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
      expect.assertions(9);

      return sut.execute(socket.character, 'aItem', 'aUser').then(() => {
        expect(mockTargetSocket.character.offers).toHaveLength(2);

        expect(mockTargetSocket.character.offers[0]).toHaveProperty('fromUserName', existingOffer.fromUserName);
        expect(mockTargetSocket.character.offers[0]).toHaveProperty('toUserName', 'aUser');
        expect(mockTargetSocket.character.offers[0].item.id).toBe(existingItem.id);

        expect(mockTargetSocket.character.offers[1]).toHaveProperty('fromUserName', expectedOffer.fromUserName);
        expect(mockTargetSocket.character.offers[1]).toHaveProperty('toUserName', expectedOffer.toUserName);
        expect(mockTargetSocket.character.offers[1].item.id).toBe(expectedOffer.item.id);

        expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser');

        expect(socket.character.output).toHaveBeenCalledWith('You offer your aItem to aUser.');
      });
    });

    test('should add offer to other user socket offers collection if existing offers exist', () => {
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      mockGetSocketByCharacterId.mockReturnValueOnce(socket);

      socket.character.name = 'TestUser';
      socket.inventory = [item];

      let existingItem = new Item({ name: 'aDifferentItem' });

      let existingOffer = {
        fromUserName: 'TestUser2',
        toUserName: 'aUser',
        item: existingItem,
      };

      mockTargetSocket.character.offers = [existingOffer];
      expect.assertions(9);

      return sut.execute(socket.character, item.name, 'aUser').then(() => {
        expect(mockTargetSocket.character.offers).toHaveLength(2);

        expect(mockTargetSocket.character.offers[0].fromUserName).toBe(existingOffer.fromUserName);
        expect(mockTargetSocket.character.offers[0].toUserName).toBe('aUser');
        expect(mockTargetSocket.character.offers[0].item).toBe(existingItem);

        expect(mockTargetSocket.character.offers[1].fromUserName).toBe(socket.character.name);
        expect(mockTargetSocket.character.offers[1].toUserName).toBe('aUser');
        expect(mockTargetSocket.character.offers[1].item.id).toBe(item.id);

        expect(mockTargetSocket.character.output).toHaveBeenCalledWith('TestUser offers you a aItem.\nTo accept the offer: accept offer TestUser');
        expect(socket.character.output).toHaveBeenCalledWith('You offer your aItem to aUser.');
      });
    });

    test('should remove offer if it is not taken before the timeout', (done) => {
      mockAutocompleteMultiple.mockReturnValueOnce({ item: item });
      mockAutocompleteCharacter.mockReturnValueOnce(mockTargetSocket.character);
      getCharacterNamesResult = ['TestUser', 'aUser'];

      socket.character.name = 'TestUser';
      socket.inventory = [item];
      expect.assertions(2);

      sut.execute(socket.character, 'aUser', 'aItem', () => {
        // verified after callback is called (this will be the last item verified)
        expect(mockTargetSocket.character.offers).toHaveLength(0);
        done();
      });
      // this is checked before the callback is run
      expect(mockTargetSocket.character.offers).toHaveLength(1);
    });
  });


  describe('help', () => {
    test('should output message', () => {
      const output = '<span class="mediumOrchid">offer &lt;item&gt; to &lt;player&gt; </span><span class="purple">-</span> Offer an item to another player.<br /><span class="mediumOrchid">offer 10gp to &lt;player&gt; </span><span class="purple">-</span> Offer currency to another player.<br />';

      sut.help(socket.character);

      expect(socket.character.output).toHaveBeenCalledWith(output);
    });
  });
});
