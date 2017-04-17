'use strict';

if (!String.prototype.format) {
  String.prototype.format = function () {
    const args = arguments;
    return this.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined') ? args[number] : match);
  };
}

if (!Object.prototype.getKeyByValue) {
  Object.defineProperty(Object.prototype, 'getKeyByValue', {
    value(value) {
      for (const prop in this) {
        if (this.hasOwnProperty(prop)) {
          if (this[prop] === value) {
            return prop;
          }
        }
      }
    },
    enumerable: false,
  });
}

if (!Array.prototype.GetFirstByDisplayName) {
  Array.prototype.GetFirstByDisplayName = function (name) {
    if (!name) return undefined;
    const item = this.find(i => i.displayName.toLowerCase() === name.toLowerCase());
    return item;
  };
}