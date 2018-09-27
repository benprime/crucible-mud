import mocks from '../../../../spec/mocks';
import Item from '../../../models/item';
import { mockGetSocketByCharacterId } from '../core/socketUtil';

jest.mock('../core/socketUtil');

describe('item model', () => {
  let item;
  let socket;

  describe('look', () => {
    beforeEach(() => {
      global.io = new mocks.IOMock();
      socket = new mocks.SocketMock();
      item = new Item({
        desc: 'Item Description',
      });
      mockGetSocketByCharacterId.mockReturnValue(socket);
    });

    test('should display item description', () => {
      socket.user.debug = false;
      return item.getDesc(socket.character).then(response => {
        expect(response).toEqual('Item Description');
      });

    });

    test('should display item id if user is admin', () => {
      socket.user.debug = true;
      return item.getDesc(socket.character).then(response => {
        expect(response).toEqual(`Item Description\nItem ID: ${item.id}`);
      });

    });
  });
});
