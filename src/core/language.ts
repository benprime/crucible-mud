/**
 * Returns an indefinite article 'a'/'an' for an object name.
 * @param {String} name
 * @returns {String} - 'a' or 'an'
 */
export const indefiniteArticle = (name) => {
  var pattern = /^([aeiou])/i;
  return name.match(pattern) ? 'an' : 'a';
};

/**
 * Converts gender string 'male'/'female' to subject pronoun 'he'/'she'/'they'
 * @param {String} gender - gender string 'male' or 'female'
 * @returns {String} - 'he', 'she', or 'they'
 */
export const pronounSubject = (gender) => {
  if (gender === 'male') {
    return 'he';
  } else if (gender === 'female') {
    return 'she';
  } else {
    return 'they';
  }
};

/**
 * Converts gender string 'male'/'female' to object pronoun 'him'/'her'/'them'
 * @param {String} gender - gender string 'male' or 'female'
 * @returns {String} - 'him', 'her', or 'them'
 */
export const pronounObject = (gender) => {
  if (gender === 'male') {
    return 'him';
  } else if (gender === 'female') {
    return 'her';
  } else {
    return 'them';
  }
};

/**
 * Converts gender string 'male'/'female' to possessive pronoun 'his'/'her'/'their'
 * @param {String} gender - gender string 'male' or 'female'
 * @returns {String} - 'his', 'her', or 'their'
 */
export const pronounPossessive = (gender) => {
  if (gender === 'male') {
    return 'his';
  } else if (gender === 'female') {
    return 'her';
  } else {
    return 'their';
  }
};

/**
 * Converts gender string 'male'/'female' to reflexive pronoun 'himself'/'hersef'/'theirself'
 * @param {String} gender - gender string 'male' or 'female'
 * @returns {String} - 'himself', 'hersef', 'theirself'
 */
export const pronounReflexive = (gender) => {
  if (gender === 'male') {
    return 'himself';
  } else if (gender === 'female') {
    return 'herself';
  } else {
    return 'themself';
  }
};

/**
 * Uppercases each work in a string.
 * @param {String} text - A string containing words to convert to title case.
 * @returns {String} - String in title case.
 */
export const upperCaseWords = (text) => {
  return text.toLowerCase()
    .split(' ')
    .map((s) => s.replace(/^\w/, c => c.toUpperCase()))
    .join(' ');
};

/**
 * Joins an array of strings into a list form using an oxford comma.
 * Example: ['bat', 'ball', 'glove'] becomes 'bat, ball, and glove'
 * @param {String[]} array
 * @returns {String} - Comma separated list.
 */
export const oxfordComma = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    return '';
  }
  let s;
  let last = array.pop();
  if (array.length > 0) {
    s = array.join(', ');
    s += `, and ${last}`;
  } else {
    s = last;
  }
  return s;
};

/**
 * Converts a verb to third person singular form.
 * Examples: 'hit' to 'hits', 'punch' to 'punches'
 * @param {String} verb - verb to convert.
 * @returns {String} - verb in third person singular form.
 */
export const verbToThirdPerson = (verb) => {
  const end = verb.slice(-2);
  if (['sh', 'ch'].includes(end)) {
    return verb + 'es';
  } else {
    return verb + 's';
  }
};

export default {
  indefiniteArticle,
  oxfordComma,
  pronounSubject,
  pronounObject,
  pronounPossessive,
  pronounReflexive,
  upperCaseWords,
  verbToThirdPerson,
};