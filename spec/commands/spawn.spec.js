'use strict';

const mocks = require('../mocks');
const sut = require('../../commands/spawn');

describe('spawn', function () {
  let socket;

  beforeAll(function () {
    socket = new mocks.SocketMock();
  });

  describe('execute', function () {
    describe('when createType is mob', function() {
      it('should output message when type is invalid', function() {
      });

      it('should create instance of mob in room mobs list', function() {
      });

      it('should output message when command successful', function() {
      });
    });

    describe('when createType is item', function() {
      it('should output message when type is invalid', function() {
      });

      it('should create instance of item in user inventory', function() {
      });

      it('should output message when command successful', function() {
      });

      it('should should save new item in user database object', function() {
      });
    });

    describe('when createType is key', function() {
      it('should output message when type is invalid', function() {
      });

      it('should create instance of key in user keys', function() {
      });

      it('should output message when command successful', function() {
      });

      it('should should save new key in user database object', function() {
      });
    });
  });
});
