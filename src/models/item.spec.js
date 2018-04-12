'use strict';

const mocks = require('../mocks');
const Item = require('../models/item');

describe('item model', function () {
  let item;
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
    item = new Item({
      desc: 'Item Description',
    });
  });

  beforeEach(function () {
    socket.reset();
  });

  describe('look', function () {
    it('should display item description', function () {
      item.look(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item Description' });
    });

    it('should display item id if user is admin', function () {
      socket.user.admin = true;
      item.look(socket);

      expect(socket.emit).toHaveBeenCalledWith('output', { message: 'Item Description\nItem ID: ' + item.id });
    });
  });
});
