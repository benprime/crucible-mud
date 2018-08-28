export const indefiniteArticle = (name) => {
  var pattern = /^([aeiou])/i;
  return name.match(pattern) ? 'an' : 'a';
};

export default {
  indefiniteArticle,
};