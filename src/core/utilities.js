'use strict';

module.exports = {
  formatMessage () {
    var args = Array.prototype.slice.call(arguments);
    var string = args.shift();
    return string.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined') ? args[number] : match);
  },
  removeItem(array, item) {
    var index = this.findIndex(i => i === item);
    if (index !== -1) {
      this.splice(index, 1);
    }
  },
};