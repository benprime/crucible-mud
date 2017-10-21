'use strict';

const mocks = require('../mocks');
const Item = require('../../models/item');
const ObjectId = require('mongodb').ObjectId;

describe('item model', function () {

  describe('look', function () {
    it('should build output string with just title and exits when short parameter is passed', function () {
    });

    it('should include inventory in output when inventory length is not zero', function () {
    });

    it('should omit inventory when user is carrying nothing', function () {
    });

    it('should include users in room when the user is not the only user in room', function () {
    });

    it('should omit users in room when the user is the only user in room', function () {
    });

    it('should include exits when there is at least one exit in the room', function () {
    });

    it('should disply none when there are no exits', function () {
    });

    it('should disply room id when user is an admin', function () {
    });
  });
});
