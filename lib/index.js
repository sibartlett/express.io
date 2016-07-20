'use strict';

var http = require('http');
var https = require('https');

var _ = require('lodash');
var express = require('express');
var expressLayer = require('express/lib/router/layer');
var expressSession = require('express-session');
var SharedSession = require("express-socket.io-session");
var io = require('socket.io');

var IoRequest = require('./request');
var IoResponse = require('./response');

delete express.session;
express.session = expressSession;
express.io = io;

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
  this.io = io.listen(this.server, options);
  this.io.router = {};

  this.io.route = function(route, next, res) {
    if (res) {
      this.router[route](next, res);
      return;
    }

    if (!next) {
      next = route;
      route = '';
    }

    if (_.isFunction(next)) {
      this.router[route] = next;
    } else {
      var ns = route.length ? route + ':' : '';
      for (var key in next) {
        this.route(ns + key, next[key]);
      }
    }
  };

  this.io.session = function(options) {
    _.defaults(options, {
      name: options.key || 'connect.sid',
      store: new express.session.MemoryStore(),
      cookie: {},
      rolling: false
    });

    var session = express.session(options);
    this.use(session);
    this.io.use(new SharedSession(session,{autoSave:true}));
  }.bind(this);

  this.io.on('connection', function(socket) {
    return initRoutes(socket, this.io);
  }.bind(this));

  var layer = new expressLayer('', {
    end: false
  }, function(req, res, next) {
    req.isSocket = false;
    req.io = {};
    req.io.route = function(route) {
      return this.io.route(route, req, res);
    }.bind(this);
    req.param = function param(name, defaultValue) {
      var params = this.params || {};
      var body = this.body || {};
      var query = this.query || {};

      if (null != params[name] && params.hasOwnProperty(name)) {
        return params[name];
      }
      if (null != body[name]) {
        return body[name];
      }
      if (null != query[name]) {
        return query[name];
      }

      return defaultValue;
    }.bind(req);
    return next();
  }.bind(this));

  this.lazyrouter();
  this._router.stack.push(layer);
  return this;
};

express.application.listen = function() {
  var args = Array.prototype.slice.call(arguments, 0);

  if (!this.server) {
    this.http();
  }

  return this.server.listen.apply(this.server, args);
};

module.exports = express;
