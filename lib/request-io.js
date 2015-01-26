'use strict';

var http = require('http'),
    RoomIO = require('./room').RoomIO;

function IoRequest(socket, request, io, respond) {
  this.socket = socket;
  this.request = request;
  this.manager = io;
  this.respond = respond || function() {};
}

IoRequest.prototype.json = function(body) {
  return this.respond(body);
};

IoRequest.prototype.status = function(statusCode) {
  return this;
};

IoRequest.prototype.sendStatus = function(statusCode) {
  var body = http.STATUS_CODES[statusCode] || String(statusCode);
  return this.respond(body);
};

IoRequest.prototype.broadcast = function(event, message) {
  return this.socket.broadcast.emit(event, message);
};

IoRequest.prototype.emit = function(event, message, cb) {
  return this.socket.emit(event, message, cb);
};

IoRequest.prototype.get = function(key, cb) {
  return this.socket.get(key, cb);
};

IoRequest.prototype.set = function(key, val, cb) {
  return this.socket.set(key, val, cb);
};

IoRequest.prototype.room = function(room) {
  return new RoomIO(room, this.io);
};

IoRequest.prototype.join = function(room) {
  return this.socket.join(room);
};

IoRequest.prototype.route = function(route) {
  return this.manager.route(route, this.request, {
    trigger: true
  });
};

IoRequest.prototype.leave = function(room) {
  return this.socket.leave(room);
};

IoRequest.prototype.on = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  return this.socket.on.apply(this.socket, args);
};

IoRequest.prototype.disconnect = function(callback) {
  return this.socket.disconnect(callback);
};

module.exports = IoRequest;
