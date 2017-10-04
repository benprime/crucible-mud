'use strict';

const Room = require('../../models/room');
const mocks = require('../mocks');
const sut = require('../../commands/unequip');

describe('unequip', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
  });

  describe('execute', function () {
    //todo: tests
  });

});