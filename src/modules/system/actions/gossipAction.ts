export default {
  name: 'gossip',
  execute(character, message) {
    return character.gossip(message);
  },
};
