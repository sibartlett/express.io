'use strict';

var http = require('http'),
    RoomIO = require('./room').RoomIO;

function IoRequest(socket, io, data, response) {
  this.socket = socket;
  this.data = data;

  var req = socket.client.request;
  this.sessionID = req.sessionID;
  this.headers = req.headers;
  this.query = req._query;
  this.cookies = req.cookies;
  this.signedCookies = req.signedCookies;
  this.url = req.url;
  if (req.user) {
    this.user = req.user;
  }

  this.session = socket.session;
  this.handshake = socket.session.handshake;

  this.io = io;
  this.response = response;
}

IoRequest.prototype.param = function(param) {
  return this.data[param] || this.query && this.query[param];
};

IoRequest.prototype.route = function(route) {
  return this.manager.route(route, this.request, this.response);
};

module.exports = IoRequest;
