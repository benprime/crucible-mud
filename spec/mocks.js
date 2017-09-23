'use strict';

// this file may become "test setup tools"
const User = require('../models/user');

// this method provides a serialization of an
// object with the keys in order
if(!JSON.orderedStringify) {

  JSON.orderedStringify = function(obj) {
    if(typeof obj != 'object') {
      throw 'orderedStringify can only stringify objects: received type: ' + typeof obj;
    }
    let keys = Object.keys(obj);
    let i, len = keys.length;
  
    keys.sort();

    const orderedProps = [];
    for (let i = 0; i < len; i++) {
      let k = keys[i];
      orderedProps.push(k + ': ' + obj[k]);
    }
    return '{' + orderedProps.join(", ") + '}';
  }
}

function getMockRoom() {
  return {
    inventory: [],
    mobs: [],
    exits: [
      { dir: 'u', roomId: 'uRoomId', closed: false },
      { dir: 'd', roomId: 'dRoomId' },
      { dir: 'n', roomId: 'nRoomId' },
      { dir: 's', roomId: 'sRoomId' },
      { dir: 'e', roomId: 'eRoomId' },
      { dir: 'w', roomId: 'wRoomId' },
      { dir: 'ne', roomId: 'neRoomId' },
      { dir: 'se', roomId: 'seRoomId' },
      { dir: 'nw', roomId: 'nwRoomId' },
      { dir: 'sw', roomId: 'swRoomId' },
    ],
    getExit: jasmine.createSpy('getExit').and.callFake(function() { return this.exits[0] }),
    save: jasmine.createSpy('save').and.callFake(function() {})
  };
}

const globalEmitSpy = jasmine.createSpy('globalEmitSpy');

function IOMock() {
  this.to = jasmine.createSpy().and.callFake(function (roomKey) {
    return {
      emit: globalEmitSpy
    };
  });
  this.sockets = {
    sockets: {}
  }
}

function SocketMock() {
  const broadcastEmitSpy = jasmine.createSpy('userSocketBroadcastEmit');
  this.emit = jasmine.createSpy('userSocketEmit');
  this.on = jasmine.createSpy('userSocketOn');

  this.broadcast = {
    to: jasmine.createSpy('userSocketBroadcastTo').and.callFake(function (roomKey) {
      return {
        emit: broadcastEmitSpy
      };
    })
  };

  this.id = 'socketid';

  const user = new User();
  user.username = 'TestUser';
  user.userId = 'userId';
  user.roomId = 'roomId';
  user.save = jasmine.createSpy('userSave');
  this.user = user;
};

module.exports = {
  getMockRoom,
  IOMock,
  SocketMock
};
