import { Types } from 'mongoose';
const { ObjectId } = Types;
import Room from '../src/models/room';
import User from '../src/models/user';
import Character from '../src/models/character';
import Mob from '../src/models/mob';

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

function getMockRoom(roomId) {
  var room = new Room();
  room._id = ObjectId(roomId);
  room.id = roomId || room._id.toString();
  room.mobs = [];
  room.inventory = [];
  room.x = 10;
  room.y = 10;
  room.z = 10;

  room.roomIds = {
    u: ObjectId().toString(),
    d: ObjectId().toString(),
    n: ObjectId().toString(),
    s: ObjectId().toString(),
    e: ObjectId().toString(),
    w: ObjectId().toString(),
    ne: ObjectId().toString(),
    nw: ObjectId().toString(),
    se: ObjectId().toString(),
    sw: ObjectId().toString(),
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

  room.createRoom = jest.fn((dir, cb) => cb());
  room.getExit = jest.fn().mockName('getExit').mockImplementation((dir) => room.exits.find(r => r.dir === dir));
  room.save = jest.fn().mockName('save');
  room.look = jest.fn().mockName('look');
  room.usersInRoom = jest.fn().mockName('usersInRoom');
  room.userInRoom = jest.fn().mockName('userInRoom');
  room.processPlayerCombatActions = jest.fn().mockName('processPlayerCombatActions');
  room.processMobCombatActions = jest.fn().mockName('processMobCombatActions');

  room.reset = function () {
    room.getExit.mockReset();
    room.save.mockReset();
    room.look.mockReset();
    room.usersInRoom.mockReset();
    if (room.mobs.remove && room.mobs.remove.calls) {
      room.mobs.remove.mockReset();
    }
  };

  return room;
}

class IOMock {
  constructor() {
    const ioMock = this;
    this.roomSpies = {};
    this.ioEmitSpy = jest.fn().mockName('globalEmitSpy');
    this.to = jest.fn().mockName().mockImplementation(function (roomKey) {
      if (!ioMock.roomSpies[roomKey]) {
        ioMock.roomSpies[roomKey] = jest.fn().mockName('globalToEmitSpy-' + roomKey);
      }
      return {
        emit: ioMock.roomSpies[roomKey],
      };
    });
    this.sockets = {
      adapter: {
        rooms: {},
      },
      connected: {},
    };
    this.addCharacterToIORoom = function (roomId, socket) {
      this.sockets.adapter.rooms[roomId] = {
        sockets: {},
      };
      this.sockets.adapter.rooms[roomId].sockets[socket.id] = socket;
    };
    this.reset = function () {
      this.ioEmitSpy.mockClear();
      this.to.mockClear();
      Object.keys(this.roomSpies).forEach(rs => this.roomSpies[rs].mockClear());
      this.sockets = {
        connected: {},
        adapter: {
          rooms: {},
        },
      };
    };
  }
}

class SocketMock {
  constructor(username) {
    let sm = this;
    // this is mocking the SocketIO socket, and is not a mongoose object.()
    // we're using ObjectId here for convenience, so it does not have to be set
    // to the _id property like it does on the mongoose objects.
    this.id = ObjectId().toString();
    this.roomSpies = {};

    let broadcastEmitSpy = jest.fn().mockName('userSocketBroadcastEmit');

    this.emit = jest.fn().mockName('userSocketEmit');
    this.on = jest.fn().mockName('userSocketOn');
    this.leave = jest.fn().mockName('userSocketLeave');
    this.join = jest.fn().mockName('userSocketJoin');
    this.to = jest.fn().mockName('userSocketTo').mockImplementation(function (roomKey) {
      if (!sm.roomSpies[roomKey]) {
        sm.roomSpies[roomKey] = jest.fn().mockName('socketRoomEmit-' + roomKey);
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
    user.id = ObjectId().toString();
    this.user = user;

    const character = new Character();
    character.name = user.username;
    character.roomId = ObjectId().toString();
    character.save = jest.fn().mockName('userSave');
    character.addExp = jest.fn().mockName('addExp');
    character.attackTarget = null;
    character.attack = jest.fn().mockName('userAttack');
    character.actionDie = '1d20';
    character.inventory = [];
    character.offers = [];
    character.partyInvites = [];
    this.character = character;

    this.reset = function () {
      broadcastEmitSpy.mockClear();
      this.emit.mockClear();
      this.on.mockClear();
      this.character.save.mockClear();
      Object.keys(this.roomSpies).forEach(rs => this.roomSpies[rs].mockClear());
    };
  }
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
  mob.die = jest.fn().mockName('mobDie');
  return mob;
}

export default {
  getMockRoom,
  getMockMob,
  IOMock,
  SocketMock,
  mobType,
};
