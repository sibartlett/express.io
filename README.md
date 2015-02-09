![express.oi](http://i.imgur.com/zzZLudd.png)

realtime-web framework for node.js, based on express.io

```
express.oi = express + socket.io + a little bit of England
```

## Simple App Setup

Here is the canonical express.oi example.

```javascript
app = require('express.oi')()
app.http().io()

//build your realtime-web app

app.listen(7076)
```

## Upgrade your existing Express apps

First install:

```bash
npm install express.oi
```

Then, simply replace this line of code

```javascript
require('express')
```

with this line of code

```javascript
require('express.oi')
```

Your app should run just the same as before!  Express.oi is designed to be a superset of Express and Socket.io.  An easy to use drop-in replacement that makes it simple to get started with the realtime-web.

## Realtime Routing is Sweet

With express.oi you can do realtime routing like a pro.

```js
app.io.route('customers', {
    create: function(req) {
        // create your customer
    },
    update: function(req) {
        // update your customer
    },
    remove: function(req) {
        // remove your customer
    },
});
```

And then on the client you would emit these events:

* `customers:create`
* `customers:update`
* `customers:delete`

Or do it the old fashioned way:

```js
app.io.route('my-realtime-route', function(req) {
    // respond to the event
});
```

## Automatic Session Support

Sessions work automatically, just set them up like normal using express.

```js
app.io.session({secret: 'express.oi makes me happy'});
```

## Double Up - Forward Normal Http Routes to Realtime Routes

It's easy to forward regular http routes to your realtime routes.

```js
app.get('/', function(req, res) {
    req.io.route('some-cool-realtime-route');
});
```



## License
It's free! Party with the MIT!

Copyright (c) 2015 Simon Bartlett

Copyright (c) 2012 Tech Pines LLC, Brad Carleton


Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
