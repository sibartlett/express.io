![express.oi](http://i.imgur.com/zzZLudd.png)

This node.js library seeks to combine [express](http://expressjs.com) and [socket.io](socket.io) into one cohesive library. This project started as a fork of [express.io](https://github.com/techpines/express.io).

### Attention!

I've started this project recently - so I may make breaking changes between releases, please check the README for each release for the latest documentation.

### Usage

```js

var express = require('express.oi');

var app = express();

// Pass in your express-session configuration
app.io.session({
  secret: 'express.oi makes me happy'
});

var messages = [];

// Regular express routes can be forwarded to express.oi routes
app.route('/messages')
  .get(function(req, res) {
    // Forward GET /messages to messages:list
    req.io.route('messages:list');
  })
  .post(function(req, res) {
    // Forward POST /messages to messages:add
    req.io.route('messages:add');
  })
  .delete(function(req, res) {
    // Forward DELETE /messages to messages:add
    req.io.route('messages:remove');
  });

// express.oi routes
app.io.route('messages', {
  list: function(req, res) {
    res.json(messages);
  },
  add: function(req, res) {
    // data is accessible from req.data (just like req.body, req.query)
    var data = req.data;

    // Or use req.param(key)
    var txt = req.param('text');

    res.status(200).json({
      text: txt
    });
  },
  remove: function(req, res) {
    // Or just send a status code
    res.sendStatus(403);
  }
});

// express.oi routes
app.io.route('examples', {
  example: function(req, res) {

    // Respond to current request
    res.status(200)
       .json({
         message: 'This is my response'
       });

    // You can check if current request is a websocket
    if (!req.isSocket) {
      return;
    }

    // Emit event to current socket
    req.socket.emit('message', 'this is a test');

    // Emit event to all clients except sender
    req.socket.broadcast.emit('message', 'this is a test');

    // sending to all clients in 'game' room(channel) except sender
    req.socket.broadcast.to('game').emit('message', 'nice game');

    // sending to individual socketid, socketid is like a room
    req.socket.broadcast.to(socketId).emit('message', 'for your eyes only');


    // sending to all clients, including sender
    app.io.emit('message', 'this is a test');

    // sending to all clients in 'game' room/channel, including sender
    app.io.in('game').emit('message', 'cool game');
  }
});

```
