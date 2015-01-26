'use strict';

var _ = require('underscore');

var regex = {
  single: /\/([^\/]+)\/?/,
  doubleOptional: /\/([^\/]+)(?:\/([^\/]+)\/?)?/,
  double: /\/([^\/]+)\/([^\/]+)\/?/
};

var configs = {
  backbone: {
    create: {
      method: 'post',
      regex: regex.single
    },
    read: {
      method: 'get',
      regex: regex.doubleOptional,
      variables: ['id']
    },
    update: {
      method: 'put',
      regex: regex.double,
      variables: ['id']
    },
    "delete": {
      method: 'delete',
      regex: regex.double,
      variables: ['id']
    }
  },
  angular: {
    list: {
      method: 'get',
      regex: regex.single
    },
    create: {
      method: 'post',
      regex: regex.single
    },
    read: {
      method: 'get',
      regex: regex.double,
      variables: ['id']
    },
    update: {
      method: 'put',
      regex: regex.double,
      variables: ['id']
    },
    "delete": {
      method: 'delete',
      regex: regex.double,
      variables: ['id']
    }
  }
};

configs.backbonjs = configs.backbone;

configs.angularjs = configs.angular;

exports.routeForward = function(options) {
  if (!_.isObject(options.config)) {
    options.type = options.config;
    options.config = configs[options.type];
    if (options.config == null) {
      throw new Error("RouteForwardError: No config for " + options.type);
    }
  }
  return function(request, response, next) {
    var index, match, meta, route, variable, _ref, _ref1;
    _ref = options.config;
    for (route in _ref) {
      meta = _ref[route];
      if (meta.method === request.method.toLowerCase()) {
        match = meta.regex.exec(request.url);
        if (match != null) {
          if (meta.variables == null) {
            meta.variables = [];
          }
          if (request.params == null) {
            request.params = {};
          }
          _ref1 = meta.variables;
          for (index in _ref1) {
            variable = _ref1[index];
            request.params[variable] = match[2 + parseInt(index)];
          }
          return request.io.route("" + match[1] + ":" + route);
        }
      }
    }
    return next();
  };
};
