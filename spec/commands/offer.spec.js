'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/offer');
const autocomplete = require('../../autocomplete');
const room = require('../../models/room');

describe('offer', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('dispatch', function () {
    beforeEach(function () {
      spyOn(sut, 'execute');
    });

    it('should call execute with match', function () {
      sut.dispatch(socket, ['offer', 'aUser', 'aItem']);
      expect(sut.execute).toHaveBeenCalledWith(socket, 'aUser', 'aItem');
    });
  });

  describe('execute', function () {
    let autocompleteResult;

    beforeEach(function(){
      spyOn(autocomplete, 'autocomplete').and.callFake(() => autocompleteResult);
    });

    it('should output message when item is not in inventory', function() {
      autocompleteResult = [];

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `aItem is not in your inventory!` });
    });

    it('should output message when item is not in inventory', function() {
      autocompleteResult = [];

      sut.execute(socket, 'aUser', 'aItem');
      expect(socket.emit).toHaveBeenCalledWith('output', { message: `Many items can be described as aItem. Be more specific.` });
    });

  });
});