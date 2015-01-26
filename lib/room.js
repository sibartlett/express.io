'use strict';

function IoRoom(name, socket) {
  this.name = name;
  this.socket = socket;
}

IoRoom.prototype.broadcast = function(event, message) {
  return this.socket.to(this.name).emit(event, message);
};

module.exports = IoRoom;
