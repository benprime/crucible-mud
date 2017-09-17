'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/inventory');

describe('inventory', function () {
  let socket;

  beforeAll(function() {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    // equipped item tests may be broken into more test cases.. or parameterized
    it('should display equipped items', function() {
    });
    it('should display backpack items', function() {
    });
    it('should display key items', function() {
    });
    it('should display currency', function() {
    });    
  });

});