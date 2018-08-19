export const currencyToString = (totalCurr) => {
  if (totalCurr < 0) return 'You are in debt';
  if (totalCurr == 0) return '0 copper';

  let t = totalCurr;

  let pp = Math.floor(t / 1000);
  t -= pp * 1000;
  let gp = Math.floor(t / 100);
  t -= gp * 100;
  let sp = Math.floor(t / 10);
  t -= sp * 10;
  let cp = Math.floor(t / 1);
  t -= cp * 1;

  const currencyArr = [];
  if (pp > 0) currencyArr.push(`${pp} platinum`);
  if (gp > 0) currencyArr.push(`${gp} gold`);
  if (sp > 0) currencyArr.push(`${sp} silver`);
  if (cp > 0) currencyArr.push(`${cp} copper`);

  return currencyArr.join(', ');
};

export const currencyPatterns = [
  /^(\d+)$/i, // if the whole string is just a number, assume copper
  /(\d+)\s?(c)/i, // cp or copper
  /(\d+)\s?(g)/i, // gp or gold
  /(\d+)\s?(s)/i, // sp or silver
  /(\d+)\s?(p)/i, // pp or platinum
];

export const currencyScale = {
  'c': 1,
  's': 10,
  'g': 100,
  'p': 1000,
};

export const currencyToInt = (currStr) => {
  let copperVal = 0;
  for (let pattern of currencyPatterns) {
    let match = currStr.match(pattern);
    if (match) {
      // only convert non-copper
      let value = match[1];
      let denom = 'c';
      if (match.length > 2) denom = match[2];
      let scale = currencyScale[denom];
      copperVal += scale * value;
    }
  }

  return copperVal;
};

export default {
  currencyToString,
  currencyPatterns,
  currencyToInt,
};
