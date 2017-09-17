'use strict';

const roomManager = require('../roomManager');
const mocks = require('../mocks');
const sut = require('../../commands/create');

describe('create', function () {
  let socket;
  let room;

  beforeAll(function() {
    socket = new mocks.SocketMock();
    room = mocks.getMockRoom();
    spyOn(roomManager, 'getRoomById').and.callFake(() => room);
    //TODO: mock roomManager.createRoom
});

  describe('execute', function () {

    describe('when type is room', function() {
      it('should accept all valid long forms of direction input', function() {
      });

      it('should accept all valid short forms of direction input', function() {
      });

      it('should output error message when direction in invalid', function() {
      });

      it('should output error message when direction in invalid', function() {
      });

      it('should output message to creator as well as to other users on successful create', function() {
      });

      // TODO: The create room lives in the roomManager. Creating a door should probably
      // also be moved to a new method called create/updateDoor on the roomManager.
      // doesn't make sense to have some state/database updates in the manager and some
      // in the command code.
      it('should update roomManager current state and database with door on success', function() {
      });
    });

    describe('when type is door', function() {
      it('should accept all valid long forms of direction input', function() {
      });

      it('should accept all valid short forms of direction input', function() {
      });

      it('should output error message when direction in invalid', function() {
      });

      it('should output error message when direction in invalid', function() {
      });

      it('should output message to creator as well as to other users on successful create', function() {
      });
    });

    it('should output error when create type is invalid', function() {
    });
      
  });

});