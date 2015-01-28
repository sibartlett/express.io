'use strict';

var express = require('express');
var expressLayer = require('express/lib/router/layer');
var expressSession = require('express-session');
var socketSession = require('./session');
var io = require('socket.io');
var http = require('http');
var https = require('https');
var async = require('async');
var middleware = require('./middleware');
var _ = require('underscore');
var IoRequest = require('./request');
var IoResponse = require('./response');
var IoRoom = require('./room');

express.io = io;
express.io.routeForward = middleware.routeForward;

var initRoutes = function(socket, io) {
  var setRoute = function(key, callback) {
    return socket.on(key, function(data, respond) {
      if (typeof data === 'function') {
        respond = data;
        data = undefined;
      }
      var response = new IoResponse(respond);
      var request = new IoRequest(socket, io, data, response);
      return callback(request, response);
    });
  };

  return _.map(io.router, function(value, key) {
    return setRoute(key, value);
  });
};

express.application.http = function() {
  this.server = http.createServer(this);
  return this;
};

express.application.https = function(options) {
  this.server = https.createServer(options, this);
  return this;
};

express.application.io = function(options) {
  options = options || {};

  _.defaults(options, {
    log: false
  });

  this.io = io.listen(this.server, options);
  this.io.router = {};
  // this.io.middleware = [];

  this.io.route = function(route, next, res) {
    if (res) {
      if (route.indexOf(':' === -1)) {
        this.router[route](next, res);
      } else {
        var split = route.split(':');
        this.router[split[0]][split[1]](next, res);
      }
    }
    if (_.isFunction(next)) {
      this.router[route] = next;
    } else {
      for (var key in next) {
        this.router[route + ':' + key] = next[key];
      }
    }
  };

  this.io.session = function(options) {

    _.defaults(options, {
      name: options.key || 'connect.sid',
      store: new expressSession.MemoryStore(),
      cookie: {},
      rolling: false
    });

    this.use(expressSession(options));
    this.io.use(socketSession(options));
  }.bind(this);


  // this.io.use = (function(this) {
  //   return function(callback) {
  //     return this.io.middleware.push(callback);
  //   };
  // })(this);

  this.io.on('connection', function(socket) {
    return initRoutes(socket, this.io);
  }.bind(this));

  this.io.broadcast = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    return this.io.sockets.emit.apply(this.io.sockets, args);
  }.bind(this);

  this.io.room = function(room) {
    return new IoRoom(room, this.io.sockets);
  }.bind(this);

  var layer = new expressLayer('', {
    end: false
  }, function(request, response, next) {
    request.io = this.io;
    request.route = function(route) {
      return request.io.route(route, request, response);
    };
    return next();
  }.bind(this));

  this.lazyrouter();
  this._router.stack.push(layer);
  return this;
};

express.application.listen = function() {
  var args = Array.prototype.slice.call(arguments, 0);
  if (this.server) {
    return this.server.listen.apply(this.server, args);
  } else {
    return express.application.listen.apply(this, args);
  }
};

module.exports = express;
