'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/look');

describe('look', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {

    it('should output short room look when short param is true', function () {
    });

    it('should output room look when lookTarget is not passed', function () {
    });

    it('should output room look when lookTarget is a direction', function () {
    });

    it('should output a message when lookTarget is a direction with a closed door', function () {
    });

    it('should output item look when lookTarget is an inventory item', function () {
    });

    it('should output mob look when lookTarget is a mob', function () {
    });

    it('should output item look when lookTarget is a room inventory item', function () {
    });
  });
});