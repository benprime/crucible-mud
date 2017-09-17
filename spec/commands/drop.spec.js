'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const sut = require('../../commands/drop');

describe('drop', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(roomManager, 'getRoomById').and.callFake(() => room);
  });

  describe('execute', function () {
    describe('when item.type is item', function() {
      beforeAll(function() {
        //todo: needs to mock item
      });

      it('should output error message when item is not found in user inventory', function() {
      });

      it('should remove item from user inventory and add to room inventory', function() {
      });

      it('should save room with new item and user without item', function() {
      });

      it('should output message to user dropping item and to other users in room', function() {
      });
    });  
    describe('when item.type is key', function() {
      beforeAll(function() {
        //todo: needs to mock key item
      });


      it('should output error message when key is not found in user keys', function() {
      });

      it('should remove key from user keys and add to room inventory', function() {
      });

      it('should save room with new key and user without key', function() {
      });

      it('should output message to user dropping key and to other users in room', function() {
      });
    });

    it('should output error when create type is invalid', function() {
    });

  });

});