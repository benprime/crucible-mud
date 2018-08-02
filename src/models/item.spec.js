import mocks from '../../spec/mocks';
import Item from '../models/item';

describe('item model', () => {
  let item;
  let socket;

  describe('look', () => {
    beforeEach(() => {
      socket = new mocks.SocketMock();
      item = new Item({
        desc: 'Item Description',
      });
    });

    test('should display item description', () => {
      item.look(socket);

      expect(socket.emit).toBeCalledWith('output', { message: 'Item Description' });
    });

    test('should display item id if user is admin', () => {
      socket.user.admin = true;
      item.look(socket);

      expect(socket.emit).toBeCalledWith('output', { message: `Item Description\nItem ID: ${item.id}` });
    });
  });
});
