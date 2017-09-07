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
    ]
  };
}

const globalEmitSpy = jasmine.createSpy();
function IOMock() {
  to: jasmine.createSpy().and.callFake(function (roomKey) {
    return {
      emit: globalEmitSpy
    };
  })
}

const broadcastEmitSpy = jasmine.createSpy();
function SocketMock() {
  this.emit = jasmine.createSpy();
  this.on = jasmine.createSpy();

  this.broadcast = {
    to: jasmine.createSpy().and.callFake(function (roomKey) {
      return {
        emit: broadcastEmitSpy
      };
    })
  };
};

module.exports = {
  getMockRoom,
  IOMock,
  SocketMock
};
