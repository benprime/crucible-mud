export default {
  formatMessage (...args: string[]) {
    const string = args.shift();
    return string.replace(/{(\d+)}/g, (match, number) => (typeof args[number] !== 'undefined') ? args[number] : match);
  },
  removeItem(array, item) {
    const index = array.findIndex(i => i === item);
    if (index !== -1) {
      return array.splice(index, 1);
    }
    return null;
  },
};