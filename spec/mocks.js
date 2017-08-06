
function getMockSocket() {
  return {
    user: {
      inventory: [],
      keys: [],
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
