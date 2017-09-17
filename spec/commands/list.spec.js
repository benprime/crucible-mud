'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/list');

describe('list', function () {
  let socket;

  beforeAll(function() {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    describe('when type is mobs', function() {
      it('should lists mobs', function() {
      });
    });

    describe('when type is items', function() {
      it('should lists items', function() {
      });
    });

    describe('when type is keys', function() {
      it('should lists keys', function() {
      });
    });

  });

  it('should output message when type is invalid', function() {
  });

  it('should be an admin command', function() {
    expect(sut.admin).toBe(true);
  });

});