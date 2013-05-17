# node-sense

### Use

```javascript
var sense = require('./sense');
        client = new sense.Sense('api_key'),
        stream = new sense.Datastream(client, {queue_size: 1, id: feed_id});


stream.addPoint(1337);
```

Inspired by https://github.com/bigkevmcd/node-cosm
