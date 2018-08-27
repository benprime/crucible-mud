
export default {
  /**
   * Sends status message to client for upating hit point display.
   * @param {Socket} socket - socket.io socket
   */
  updateHUD(socket) {
    socket.emit('hud', {
      currentHP: socket.character.currentHP,
      maxHP: socket.character.maxHP,
    });
  },
};
