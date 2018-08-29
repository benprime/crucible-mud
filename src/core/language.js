export const indefiniteArticle = (name) => {
  var pattern = /^([aeiou])/i;
  return name.match(pattern) ? 'an' : 'a';
};

export const pronounSubject = (gender) => {
  if (gender === 'male') {
    return 'he';
  } else if (gender === 'female') {
    return 'she';
  } else {
    return 'they';
  }
};

export const pronounObject = (gender) => {
  if (gender === 'male') {
    return 'him';
  } else if (gender === 'female') {
    return 'her';
  } else {
    return 'them';
  }
};

export const pronounPossessive = (gender) => {
  if (gender === 'male') {
    return 'his';
  } else if (gender === 'female') {
    return 'her';
  } else {
    return 'their';
  }
};

export const upperCaseWords = (text) => {
  return text.toLowerCase()
    .split(' ')
    .map((s) => s.replace(/^\w/, c => c.toUpperCase()))
    .join(' ');
};

export const oxfordComma = (list) => {
  if(!Array.isArray(list) || list.length === 0) {
    return '';
  }
  let s;
  let last = list.pop();
  if (list.length > 0) {
    s = list.join(', ');
    s += `, and ${last}`;
  } else {
    s = last;
  }
  return s;
};

export default {
  indefiniteArticle,
  pronounSubject,
  pronounObject,
  pronounPossessive,
  upperCaseWords,
};