'use strict';

const Room = require('../src/models/room');
const User = require('../src/models/user');
const Mob = require('../src/models/mob');
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
  room._id = new ObjectID();
  room.mobs = [];
  room.mobs.remove = jasmine.createSpy('removeMob').and.callThrough();

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
  room.processPlayerCombatActions = jasmine.createSpy('processPlayerCombatActions').and.callFake(() => { });
  room.processMobCombatActions = jasmine.createSpy('processMobCombatActions').and.callFake(() => { });

  room.reset = function () {
    room.getExit.calls.reset();
    room.save.calls.reset();
    room.look.calls.reset();
    room.usersInRoom.calls.reset();
    if(room.mobs.remove && room.mobs.remove.calls) {
      room.mobs.remove.calls.reset();
    }
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

  this.addUserToIORoom = function(roomId, socket) {

    this.sockets.adapter.rooms[roomId] = {
      sockets: {},
    };
    this.sockets.adapter.rooms[roomId].sockets[socket.id] = socket;
  };

  this.reset = function () {
    this.ioEmitSpy.calls.reset();
    this.to.calls.reset();
    Object.keys(this.roomSpies).forEach(rs => this.roomSpies[rs].calls.reset());
    this.sockets = {
      connected: {},
      adapter: {
        rooms: {},
      },
    };
  };
}

function SocketMock(username) {
  let sm = this;
  // this is mocking the SocketIO socket, and is not a mongoose object.
  // we're using ObjectId here for convenience, so it does not have to be set
  // to the _id property like it does on the mongoose objects.
  this.id = new ObjectID().toString();
  this.roomSpies = {};
  let broadcastEmitSpy = jasmine.createSpy('userSocketBroadcastEmit');
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
  user.username = username ? username : 'TestUser';
  user.userId = new ObjectID();
  user.roomId = new ObjectID();
  user.save = jasmine.createSpy('userSave');
  user.addExp = jasmine.createSpy('addExp');
  user.attackTarget = null;
  user.attack = jasmine.createSpy('userAttack');
  user.inventory = [];
  user.inventory.remove = jasmine.createSpy('inventoryRemove').and.callThrough();
  this.user = user;

  this.offers = [];

  this.reset = function () {
    broadcastEmitSpy.calls.reset();
    this.emit.calls.reset();
    this.on.calls.reset();
    this.user.save.calls.reset();
    this.user.inventory.remove.calls.reset();
    Object.keys(this.roomSpies).forEach(rs => this.roomSpies[rs].calls.reset());
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

function getMockMob(roomId) {
  let mob = new Mob(mobType, roomId, 0);
  mob.die = jasmine.createSpy('mobDie');
  return mob;
}

module.exports = {
  getMockRoom,
  getMockMob,
  IOMock,
  SocketMock,
  mobType,
};
