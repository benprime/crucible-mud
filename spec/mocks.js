
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
  };
}

module.exports = {
  getMockSocket,
  getMockRoom,
};
