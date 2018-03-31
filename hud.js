
module.exports = {
  updateHUD(socket) {
    socket.emit('hud', {
      currentHP: socket.user.currentHP,
      maxHP: socket.user.maxHP,
    });
  },
};
