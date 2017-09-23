'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/inventory');

describe('inventory', function () {
  let socket;

  beforeAll(() => socket = new mocks.SocketMock());
  beforeEach(() => socket.emit.calls.reset());

  describe('execute', function () {
    it('should display equipped items', function() {
      // arrange
      socket.inventory = [];

      // act
      sut.execute(socket);

      // assert
      expect(socket.emit).toHaveBeenCalledTimes(1);
      //expect(socket.emit).toHaveBeenCalledWith('output', {message: ''})
    });
    it('should display backpack items', function() {
    });
    it('should display key items', function() {
    });
    it('should display currency', function() {
    });    
  });

});