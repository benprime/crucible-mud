'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/offer');

describe('offer', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should', function() {
      //TODO: when offer method is re-implemented
    });

  });
});