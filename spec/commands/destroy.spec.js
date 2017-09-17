'use strict';

const roomManager = require('../../roomManager');
const mocks = require('../mocks');
const sut = require('../../commands/destroy');

describe('destroy', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(roomManager, 'getRoomById').and.callFake(() => room);
  });

  describe('execute', function () {
    describe('when type is mob', function() {
      beforeAll(function() {
        //todo: needs to mock autocomplete for mob
      });

      it('should output error message when mob not found', function() {
      });
      it('should remove mob from room object when successful', function() {
      });
      it('should output message to running user and users in room', function() {
      });
    });  
    describe('when type is item', function() {
      beforeAll(function() {
        //todo: needs to mock autocomplete for item
      });
      it('should output error when inventory does not contain item', function() {
      });
      it('should remove item from inventory in socket user object', function() {
      });
      it('should save user to database with item removed', function() {
      });
      it('should output message to running user when succesful', function() {
      });
    });

    it('should output error when create type is invalid', function() {
    });

    it('should be an admin command', function() {      
      expect(sut.admin).toBe(true);
    });
      
  });

});