function getMockSocket() {
  return {
    user: {
      name: 'a user',
      inventory: [],
      keys: [],
    },
    broadcast: () => {
      return {
        to: () => {
          return {
            emit: emit
          }
        }
      }
    },
    emit: () => {}
  };
}

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

module.exports = {
  getMockSocket,
  getMockRoom,
};
