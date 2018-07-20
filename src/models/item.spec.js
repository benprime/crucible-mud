const mocks = require('../../spec/mocks');
const Item = require('../models/item');

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

    it('should display item description', () => {
      item.look(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item Description' });
    });

    it('should display item id if user is admin', () => {
      socket.user.admin = true;
      item.look(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: `Item Description\nItem ID: ${item.id}` });
    });
  });
});
