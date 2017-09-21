function getMockRoom() {
  return {
    inventory: [],
    mobs: [],
    exits: [
      { dir: 'u', roomId: 'uRoomId' },
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
    save: jasmine.createSpy('saveRoom')
  };
}

const globalEmitSpy = jasmine.createSpy();

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

  this.user = {
    username: 'TestUser',
    userId: 'userId',
    roomId: 'roomId',
    save: jasmine.createSpy('userSave')
  }
};

module.exports = {
  getMockRoom,
  IOMock,
  SocketMock
};
