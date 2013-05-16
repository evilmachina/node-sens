# node-sense

### Use

```javascript
var sense = require('./sense');
        client = new sense.Sense('api_key'),
        feed = new sense.Feed(sense, {id: feed_id}),
        stream = new sense.Datastream(client, feed, {queue_size: 20});


stream.addPoint(1337);
```

Inspired by https://github.com/bigkevmcd/node-cosm
