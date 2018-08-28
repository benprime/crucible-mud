import config from '../config';
import { updateHUD } from '../core/hud';
import socketUtil from '../core/socketUtil';

const phaseLabels = [

  // day
  'early morning',
  'midmorning',
  'afternoon',

  // night
  'dusk',
  'midnight',
  'false dawn',
];

let currentIndex = 0;
let phaseLength = config.DAY_LENGTH / 6;
export let dayPhase = phaseLabels[0];

setInterval(() => {
  currentIndex = currentIndex % phaseLabels.length;
  
  // new day events would go here
  if (currentIndex === 0) {
    //socketUtil.getAllSockets().forEach(s => socketUtil.output(s, '<span class="yellow">A new day dawns.</span>'));
  }
  dayPhase = phaseLabels[currentIndex];
  currentIndex++;
  socketUtil.getAllSockets().forEach(s => updateHUD(s));
}, phaseLength);

export default {
  dayPhase,
};