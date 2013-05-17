'use strict';

var request = require('request'),
    _ = require('underscore');

function Sense(apiKey, options) {
    var self = this;

    options = options || {};
    self.apiKey = apiKey;
    self.server = options.server || 'http://api.sen.se';
}


function Queue(maximum) {
    var self = this;

    self.queue  = [];
    self.offset = 0;
    self.maximum = maximum;
}

/*
 * Return true if the queue is empty.
 */
Queue.prototype.isEmpty = function() {
    return (this.queue.length === 0);
};

/*
 * Return true if the queue is full.
 */
Queue.prototype.isFull = function () {
    return this.getLength() === this.maximum;
};
/*
 * Returns the length of the queue.
 */
Queue.prototype.getLength = function() {
    return (this.queue.length - this.offset);
}

/*
 * Enqueues an item.
 * 
 * Throws an error if the queue size would be exceeded by enqueing the item.
 */
Queue.prototype.enqueue = function(item) {
    if (this.getLength() === this.maximum) {
        throw new Error('Queue size ' + this.maximum + ' exceeded.');
    }
    this.queue.push(item);
};

/*
 * Dequeue an item and return it.
 * 
 * Returns undefined if the queue is empty.
 */
Queue.prototype.dequeue = function () {
    if (this.queue.length === 0)
        return undefined;
    var item = this.queue[this.offset];

    if (++ this.offset * 2 >= this.queue.length){
        this.queue  = this.queue.slice(this.offset);
        this.offset = 0;
    }
    return item;
};

function Datastream(sense, options) {
    var self = this;

    self._sense = sense;
    
    options = options || {};
    self.id = options.id;

    if (typeof sense === 'undefined' ||
        typeof options.id === 'undefined') {
        throw new Error('Must provide a sense and Id for this Datastream.');
    }

    self._queue_size = (typeof options.queue_size === 'undefined') ? 1 : options.queue_size;
    if (self._queue_size < 1 || self._queue_size > 500) {
        throw new Error('queue must be between 1 and 500.');   
    }
    self._queue = new Queue(self._queue_size);
}

Datastream.prototype.toJSON = function () {
    var values = _.clone(this);
    _.each(values, function (value, key, list) {
        if (key[0] === '_' ||
          typeof value === 'undefined' ||
          typeof value === 'function') {
            delete values[key];
        };
    });
    return values;
};

/*
 * This is here because we can't use Sinon's fake timer with node-jasmine
 * https://github.com/mhevery/jasmine-node/issues/171
 */
Datastream.prototype.getDate = function () {
    return new Date();
}

Datastream.prototype.addPoint = function (value, at, callback) {
    var self = this;
    if (typeof at === "undefined") {
        at = self.getDate();
    }
    self._queue.enqueue({feed_id:self.id, timetag: at, value: value});
    if (self._queue.isFull()) {
        var points = [],
            value = self._queue.dequeue(),
            url = self._sense.server + '/events/';

        while (typeof value !== "undefined") {
            points.push(value);
            value = self._queue.dequeue();
        }
        request.post({url: url, json: points, headers: {'sense_key': self._sense.apiKey}}, callback);
    }
};

/*function Feed(sense, options) {
    var self = this;

    self._sense = sense;
    options = options || {};

    if (typeof options.title === 'undefined' &&
        typeof options.id === 'undefined') {
        throw new Error('Must provide a title or id.');
    }
    self.title = options.title;
    self.version = options.version || '1.0.0';
    self.website = options.website;
    self.tags = options.tags || [];
    self.id = options.id;
    self.private = options.private || false;
}

Feed.prototype.toJSON = function () {
    var values = _.clone(this);
    _.each(values, function (value, key, list) {
        if (key[0] === '_' ||
          typeof value === 'undefined' ||
          typeof value === 'function') {
            delete values[key];
        };
    });
    return values;
};*/


exports.Sense = Sense;
//exports.Feed = Feed;
exports.Datastream = Datastream;
exports.Queue = Queue;