'use strict';

const Room = require('../models/room');
const User = require('../models/user');
const ObjectID = require('mongodb').ObjectID;

// this method provides a serialization of an
// object with the keys in order
if (!JSON.orderedStringify) {
  JSON.orderedStringify = function (obj) {
    if (typeof obj != 'object') {
      throw 'orderedStringify can only stringify objects: received type: ' + typeof obj;
    }
    let keys = Object.keys(obj);
    let len = keys.length;

    keys.sort();

    const orderedProps = [];
    for (let i = 0; i < len; i++) {
      let k = keys[i];
      orderedProps.push(k + ': ' + obj[k]);
    }
    return '{' + orderedProps.join(', ') + '}';
  };
}

function getMockRoom() {
  var room = new Room();
  room.id = new ObjectID();
  room.mobs = [];

  room.roomIds = {
    u: new ObjectID(),
    d: new ObjectID(),
    n: new ObjectID(),
    s: new ObjectID(),
    e: new ObjectID(),
    w: new ObjectID(),
    ne: new ObjectID(),
    nw: new ObjectID(),
    se: new ObjectID(),
    sw: new ObjectID(),
  };

  room.exits = [
    { dir: 'u', roomId: room.roomIds.u, closed: false },
    { dir: 'd', roomId: room.roomIds.d },
    { dir: 'n', roomId: room.roomIds.n },
    { dir: 's', roomId: room.roomIds.s },
    { dir: 'e', roomId: room.roomIds.e },
    { dir: 'w', roomId: room.roomIds.w },
    { dir: 'ne', roomId: room.roomIds.ne },
    { dir: 'se', roomId: room.roomIds.se },
    { dir: 'nw', roomId: room.roomIds.nw },
    { dir: 'sw', roomId: room.roomIds.sw },
  ];

  room.getExit = jasmine.createSpy('getExit').and.callFake(function () { return room.exits[0]; });
  room.save = jasmine.createSpy('save').and.callFake(() => { });
  room.look = jasmine.createSpy('look').and.callFake(() => { });
  room.usersInRoom = jasmine.createSpy('usersInRoom');

  room.reset = function () {
    room.getExit.calls.reset();
    room.save.calls.reset();
    room.look.calls.reset();
    room.usersInRoom.calls.reset();
  };

  return room;
}

function IOMock() {
  // todo: restructure this to bind the roomCalls and emit spies together
  const ioMock = this;
  this.roomSpies = {};
  this.ioEmitSpy = jasmine.createSpy('globalEmitSpy');

  this.to = jasmine.createSpy().and.callFake(function (roomKey) {
    if (!ioMock.roomSpies[roomKey]) {
      ioMock.roomSpies[roomKey] = jasmine.createSpy('globalToEmitSpy-' + roomKey);
    }
    return {
      emit: ioMock.roomSpies[roomKey],
    };
  });

  this.sockets = {
    adapter: {
      rooms: {},
    },
    connected: {
    },
  };

  this.reset = function () {
    this.ioEmitSpy.calls.reset();
    this.to.calls.reset();
  };
}

function SocketMock() {
  const sm = this;
  this.id = new ObjectID();
  this.roomSpies = {};
  const broadcastEmitSpy = jasmine.createSpy('userSocketBroadcastEmit');
  this.emit = jasmine.createSpy('userSocketEmit');
  this.on = jasmine.createSpy('userSocketOn');
  this.leave = jasmine.createSpy('userSocketLeave');
  this.join = jasmine.createSpy('userSocketJoin');
  this.to = jasmine.createSpy('userSocketTo').and.callFake(function (roomKey) {
    if (!sm.roomSpies[roomKey]) {
      sm.roomSpies[roomKey] = jasmine.createSpy('socketRoomEmit-' + roomKey);
    }

    return {
      emit: sm.roomSpies[roomKey],
    };
  });

  this.broadcast = {
    to: this.to,
  };

  const user = new User();
  user.username = 'TestUser';
  user.userId = new ObjectID();
  user.roomId = new ObjectID();
  user.save = jasmine.createSpy('userSave');
  this.user = user;

  this.reset = function () {
    this.broadcast.to.calls.reset();
    broadcastEmitSpy.calls.reset();
    this.emit.calls.reset();
    this.on.calls.reset();
    this.user.save.calls.reset();
    this.roomCalls = [];
  };
}

const mobType = {
  name: 'kobold',
  desc: 'an ugly kobold',
  displayName: 'kobold sentry',
  adjectives: [
    {
      name: 'big',
      modifiers: {
        hp: 10,
        xp: 0,
        minDamage: 0,
        maxDamage: 0,
        hitDice: 0,
        attackInterval: 250,
      },
    },
  ],
  attackInterval: 4000,
  hitDice: '1d4',
  hp: 10,
  xp: 20,
  minDamage: 1,
  maxDamage: 3,
  tauntInterval: 12000, // every 3 rounds
  deathMessage: 'The {0} crumbles to dust.',
  taunts: [
    'The {0} growls at {1} aggressively!',
    'The {0} circles {1}, looking for an opening!',
    'The {0} bellows a challenge!',
  ],
};




module.exports = {
  getMockRoom,
  IOMock,
  SocketMock,
  mobType,
};
