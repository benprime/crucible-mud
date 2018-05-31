'use strict';

if (!String.prototype.format) {
  String.prototype.format = function () {
    const args = arguments;
    return this.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined') ? args[number] : match);
  };
}

if (!Array.prototype.remove) {
  Array.prototype.remove = function (obj) {
    var index = this.findIndex(i => i === obj);
    if (index !== -1) {
      this.splice(index, 1);
    }
  };
}

