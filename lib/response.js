'use strict';

var http = require('http');

function IoResponse(respond) {
  this.respond = respond || function() {};
}

IoResponse.prototype.json = function(body) {
  return this.respond(body);
};

IoResponse.prototype.jsonp = IoResponse.prototype.json;
IoResponse.prototype.send = IoResponse.prototype.json;

IoResponse.prototype.status = function(statusCode) {
  return this;
};

IoResponse.prototype.sendStatus = function(statusCode) {
  var body = http.STATUS_CODES[statusCode] || String(statusCode);
  return this.respond(body);
};

module.exports = IoResponse;
