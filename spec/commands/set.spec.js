'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/set');

describe('set', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    describe('when type is room', function() {
      it('should only allow properties in property whitelist', function() {
      });
  
      it('should update room in room cache and room database object on success', function() {
      });

      it('should output messages on successs', function() {
      });
    });
  });
});