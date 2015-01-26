'use strict';

var RoomIO = require('./room').RoomIO;

function HttpRequest(request, response, io) {
  this.request = request;
  this.response = response;
  this.io = io;
}

HttpRequest.prototype.status = function(statusCode) {
  this.response.status(statusCode);
  return this;
};

HttpRequest.prototype.sendStatus = function(statusCode) {
  return this.response.sendStatus(statusCode);
};

HttpRequest.prototype.json = function(body) {
  var args = Array.prototype.slice.call(arguments, 0);
  return this.response.json.apply(this.response, args);
};

HttpRequest.prototype.respond = HttpRequest.prototype.json;

HttpRequest.prototype.route = function(route) {
  return this.io.route(route, this.request, {
    trigger: true
  });
};

HttpRequest.prototype.broadcast = function(event, message) {
  return this.io.broadcast.emit(event, message);
};

HttpRequest.prototype.room = function(room) {
  return new RoomIO(room, this.socket);
};

module.exports = HttpRequest;
