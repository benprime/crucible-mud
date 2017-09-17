'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/move');

describe('move', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    it('should output messages when direction is invalid', function() {
    });

    it('should output messages when direction has closed door', function() {
    });
    
    it('should be successful when direction has open door', function() {
    });

    it('should emit movement sounds to adjacent rooms on successful move', function() {

    });

    it('should output messages on successful move', function() {

    });

    it('should break off combat on successful move', function() {

    });

    it('should update user object and database on successful move', function() {

    });

  });
});