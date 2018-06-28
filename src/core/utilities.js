'use strict';

module.exports = {
  formatMessage () {
    var args = Array.prototype.slice.call(arguments);
    var string = args.shift();
    return string.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined') ? args[number] : match);
  },
  removeItem(array, item) {
    var index = array.findIndex(i => i === item);
    if (index !== -1) {
      array.splice(index, 1);
    }
  },
};