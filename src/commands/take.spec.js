import { mockGetById } from '../models/room';
import { mockAutocompleteTypes } from '../core/autocomplete';
import { mockGetSocketByUsername } from '../core/socketUtil';
import mocks from '../../spec/mocks';
import sut from './take';
import Item from '../models/item';
import { Types } from 'mongoose';
const { ObjectId } = Types;


jest.mock('../models/room');
jest.mock('../core/autocomplete');
jest.mock('../core/socketUtil');

global.io = new mocks.IOMock();
let socket = new mocks.SocketMock();
let mockRoom = mocks.getMockRoom();
mockGetById.mockReturnValue(mockRoom);


describe('take', () => {

  describe('dispatch', () => {
    beforeEach(() => {
      jest.spyOn(sut, 'execute');
      socket.emit.mockClear();
    });

    test('should call execute with match', () => {
      sut.dispatch(socket, ['take', 'aItem']);

      expect(sut.execute).toBeCalledWith(socket, 'aItem');
    });

    test('should output message if multiple matches', () => {
      sut.dispatch(socket, 'take', 'aItem', 'anotherItem');

      expect(socket.emit).toBeCalledWith('output', { message: 'What do you want to take?' });
    });
  });

  describe('execute', () => {

    beforeEach(() => {
      socket.emit.mockReset();
      socket.user.save.mockReset();
      mockAutocompleteTypes.mockReset();
    });

    test('should update from/to inventory on successful offer/take', () => {
      let offeringSocket = new mocks.SocketMock();

      let offeredItem = new Item();
      offeredItem._id = new ObjectId();
      offeredItem.name = 'aItem';
      offeredItem.displayName = 'aItem display name';

      mockAutocompleteTypes.mockReturnValueOnce(offeredItem);
      mockGetSocketByUsername.mockReturnValueOnce(offeringSocket);

      offeringSocket.user.username = 'aUser';
      offeringSocket.user.inventory = [offeredItem];

      socket.offers = [{
        fromUserName: offeringSocket.user.username,
        toUserName: socket.user.username,
        item: offeredItem,
      }];

      sut.execute(socket, 'aItem');

      expect(socket.offers).toHaveLength(0);
      expect(socket.emit).toBeCalledWith('output', { message: `${offeredItem.displayName} was added to your inventory.` });
      expect(socket.user.save).toHaveBeenCalled();
      expect(socket.user.inventory).toHaveLength(1);
      expect(socket.user.inventory[0].name).toEqual('aItem');

      expect(offeringSocket.emit).toBeCalledWith('output', { message: `${offeredItem.displayName} was removed from your inventory.` });
      expect(offeringSocket.user.save).toHaveBeenCalled();
      expect(offeringSocket.user.inventory).toHaveLength(0);
    });

    test('should output message when item is not found', () => {
      mockRoom.save.mockClear();
      mockAutocompleteTypes.mockReturnValueOnce(null);

      sut.execute(socket, 'itemNotThere');

      expect(socket.emit).toBeCalledWith('output', { message: 'You don\'t see that here!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(socket.user.save).not.toHaveBeenCalled();
    });

    test('should output message when item is fixed', () => {
      mockRoom.save.mockClear();
      socket.user.inventory.length = 0;

      const fixedItem = {
        id: 'aItemId',
        name: 'aItem',
        displayName: 'aItem display name',
        fixed: true,
      };
      mockAutocompleteTypes.mockReturnValueOnce(fixedItem);


      sut.execute(socket, 'aItem');

      expect(socket.user.inventory).toHaveLength(0);
      expect(socket.emit).toBeCalledWith('output', { message: 'You cannot take that!' });
      expect(mockRoom.save).not.toHaveBeenCalled();
      expect(socket.user.save).not.toHaveBeenCalled();
    });

    test('should update the room/user and save room/user to database', () => {
      const item = {
        id: 'aItemId',
        name: 'aItem',
        displayName: 'aItem display name',
      };
      mockRoom.inventory = [item];
      mockAutocompleteTypes.mockReturnValueOnce(item);

      sut.execute(socket, 'aItem');

      expect(mockRoom.inventory).not.toContain(item);
      // THIS IS RAD
      expect(socket.user.inventory).toContainEqual(expect.objectContaining({ name: 'aItem' }));

      expect(socket.emit).toBeCalledWith('output', { message: `${item.displayName} was added to your inventory.` });
      expect(socket.user.save).toHaveBeenCalled();
      expect(socket.emit).toBeCalledWith('output', { message: `${item.displayName} taken.` });
      expect(socket.broadcast.to(socket.user.roomId).emit).toBeCalledWith('output', { message: `${socket.user.username} takes ${item.displayName}.` });
    });
  });

  describe('help', () => {
    test('outputs message', () => {
      sut.help(socket);

      expect(socket.emit).toBeCalledWith('output', { message: '<span class="mediumOrchid">take &lt;item name&gt </span><span class="purple">-</span> Move &lt;item&gt; into inventory. <br />' });
    });
  });
});
