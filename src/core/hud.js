
export default {
  updateHUD(socket) {
    socket.emit('hud', {
      currentHP: socket.character.currentHP,
      maxHP: socket.character.maxHP,
    });
  },
};
