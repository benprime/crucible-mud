import { dayPhase } from '../core/dayCycle';

/**
 * Sends status message to client for upating hit point display.
 * @param {Socket} socket - socket.io socket
 */
export const updateHUD = (socket) => {
  socket.emit('hud', {
    currentHP: socket.character.currentHP,
    maxHP: socket.character.maxHP,
    dayPhase: dayPhase,
  });
};

export default {
  updateHUD,
};
