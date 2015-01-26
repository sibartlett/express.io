'use strict';

/**
* pass session...
* - cookieParse
* - store
* - key
*
* returns a socket.io compatible middleware (v1.+)
* which attaches the session to socket.session
*
* if no session could be found it nexts with an error
*
* handle the error with sockets.on("error", ...)
*
* @param {Object} options
* @returns {Function} handleSession
*/
function ioSession(options) {

  var cookieParser = require('cookie-parser')(options.secret),
      sessionStore = options.store,
      key = options.key;

  function findCookie(handshake) {
    return handshake.secureCookies && handshake.secureCookies[key] ||
           handshake.signedCookies && handshake.signedCookies[key] ||
           handshake.cookies && handshake.cookies[key];
  }

  function getSession(socketHandshake, callback) {
    cookieParser(socketHandshake, {}, function (err) {
      if(err) {
        return callback(err);
      }

      var sessionID = findCookie(socketHandshake);

      if (!sessionID) {
        return callback();
      }

      sessionStore.load(sessionID, function (err, session) {
        if(err) {
          return callback(err);
        }

        callback(null, session);
      });
    });
  }

  return function handleSession(socket, next) {
    getSession(socket.request, function (err, session) {
      if(err) {
        return next(err);
      }
      if (session) {
        socket.session = session;
      }
      next();
    });
  };
}

module.exports = ioSession;
