import { EventEmitter } from 'events';
import config from '../config';

let lastRound = new Date();
let round = 0;

class GameManager extends EventEmitter {
  constructor() {
    super();

    const self = this;
    setInterval(function () {
      const now = new Date().getTime();

      // round tracker
      let newRound = false;
      if (now - lastRound >= config.ROUND_DURATION) {
        lastRound = now;
        round++;
        round = round % 100;
        newRound = true;
      }

      self.emit('frame', now, round, newRound);

    }, config.GAME_INTERVAL);

  }
}

const gameManager = new GameManager();

export default gameManager;