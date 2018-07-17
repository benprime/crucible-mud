const uuidv4 = require('uuid/v4');

function Party(leaderId) {
  this.id = uuidv4();
  this.leaderId = leaderId;
  this.memberSockets = [];

  this.Add = function(socket) {
    this.memberSockets.push(socket);
  };
}

module.exports = Party;
