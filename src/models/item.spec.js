'use strict';

const mocks = require('../../spec/mocks');
const Item = require('../models/item');

describe('item model', function () {
  let item;
  let socket;

  describe('look', function () {
    beforeEach(function () {
      socket = new mocks.SocketMock();
      item = new Item({
        desc: 'Item Description',
      });
    });

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
