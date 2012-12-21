
# Express.io Examples

All of our examples work on node 0.8.x.  To get started run the following commands:

```bash
git clone git://github.com/techpines/express.io
cd express.io/examples
npm install
```

Then `cd` into an example directory and run:

```bash
node app.js
```

Enjoy!

## Simple HTTP + Socket.io

This is the cannonical express.io example.  It does nothing, except set up 
an HTTP server and a Socket.io server together.

```js
app = require('express.io')()
app.http().io()

// build realtime-web app

app.listen(7076)
```

## Simple HTTPS + Socket.io

This is the same as the HTTP example, but for HTTPS.  You have to pass the key and cert contents as an option.

```js
fs = require('fs')
options = {
    key: fs.readFileSync('./key'), 
    cert: fs.readFileSync('./cert')
} 

app = require('express.io')()
app.https(options).io()

// build realtime-web app

app.listen(7076)
```

## Simple Example Using Routes

Express.io comes with a simple Socket.io routing system.  Use `app.io.route` by providing a `route` and a `callback`.  The `callback` receives a Socket.io request object.

#### Server

```js
app = require('express.io')()
app.http().io()

// Setup the hello route.
app.io.route('hello', function(req) {
    console.log('Socket says ' + req.body.hello)
})

// Send the client html.
app.get('/', function(req, res) { 
    res.sendfile(__dirname + '/client.html')
})

app.listen(7076)
```

#### Client

```html
<script src="/socket.io/socket.io.js"></script>
<script>
socket = io.connect()

socket.emit('hello', {hello: 'client is happy'})

</script>
```

## Using Sessions

Sessions are setup as you would normally do with express!  Nothing different.  When you start making socket.io requests then you will have access to the express session.  Use it to store user data, or for authentication, whatever.

Note that you need to save the session explicitly for socket.io requests, because there is no guarantee of a response, unlike a noraml http request.

```js
express = require('express.io')
app = express().http().io()

// Setup your sessions.
app.use(express.cookieParser())
app.use(express.session({secret: 'monkey'}))

// Setup a route to get the sockets 'hey' event.
app.io.route('hey', function(req) {
    req.session.name = req.data
    req.session.save(function() {
        req.socket.emit('how are you?')
    })
})

// Make sure to 'chat' with the socket, it might be lonely.
app.io.route('chat', function(req) {
    req.session.feelings = req.data
    req.session.save(function() {
        req.socket.emit('cool', req.session)
    })
})

// Send back the client html.
app.get('/', function(req, res) {
    req.session.loginDate = new Date().toString()
    res.sendfile(__dirname + '/client.html')
})

app.listen(7076)
```

## Realtime Canvas

This is a realtime canvas example.  If you draw on the canvas with two browser windows open you will see how socket.io broadcast works.

This example is really cool, and it works right of the box, so give it a try!


#### Server

```js
express = require('express.io')
app = express().http().io()

// Static serve for drag and drop library.
app.use(express.static(__dirname))

// Broadcast all draw clicks.
app.io.route('drawClick', function(req) {
    req.socket.broadcast.emit('draw', req.body)
})

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/client.html')
})

app.listen(7076)
```

#### Client

```html
<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"></script>
<script type="text/javascript" src="/lib/jquery.event.drag-2.0.js"></script>
<script src="/socket.io/socket.io.js"></script>
<script>
    App = {}
    App.socket = io.connect()

    // Draw Function
    App.draw = function(data) {
        if (data.type == "dragstart") {
            App.ctx.beginPath()
            App.ctx.moveTo(data.x,data.y)
        } else if (data.type == "drag") {
            App.ctx.lineTo(data.x,data.y)
            App.ctx.stroke()
        } else {
            App.ctx.stroke()
            App.ctx.closePath()
        }
    }

    App.socket.on('draw', App.draw) // draw from other sockets

    // Bind click and drag events to drawing and sockets.
    $(function() {
        App.ctx = $('canvas')[0].getContext("2d")
        $('canvas').live('drag dragstart dragend', function(e) {
            offset = $(this).offset()
            data = {
                x: (e.clientX - offset.left), 
                y: (e.clientY - offset.top),
                type: e.handleObj.type
            }
            App.draw(data) // draw yourself
            App.socket.emit('drawClick', data) // broadcast draw
        })
    })         
</script>
<canvas width="800px" height="400px" style="margin: 0 auto"></canvas>
```

## Scaling your Socket.io for Multi-Process with Redis

If you need to scale your socket.io server past one process, (which hopefully you will).  Then you need to take advantage of a pub/sub server.  Here is an example using Redis with multiple processes.

You need to install redis on you machine for this to run, but it's pretty simple and well worth it.

#### Server

```js
express = require('express.io')
redis = require('redis')
RedisStore = express.io.RedisStore

cluster = require('cluster')
numCPUs = require('os').cpus().length;

// This is what the workers will do.
workers = function() {
    app = express().http().io()

    app.io.set('store', new express.io.RedisStore({
        redisPub: redis.createClient(),
        redisSub: redis.createClient(),
        redisClient: redis.createClient()
    }))

    app.listen(7076)
}


// Start forking if you are the master
if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) { cluster.fork() } 
} else { workers() }
```
