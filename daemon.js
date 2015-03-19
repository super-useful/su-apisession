var EventEmitter = require('events').EventEmitter;
var path = require('path');

var co = require('co');
var defer = require('co-defer');
var is = require('super-is');
var iter = require('super-iter');
var CONF = require('config');
var getenv = require('getenv');
var sleep = require('co-sleep');

var session = require('./');
var store = require('./' + (CONF.app.session.type || 'redis'));

var bus = new EventEmitter();

var cleanupTime = CONF.app.session.cleanup_time;
var cleanupInterval = CONF.app.session.cleanup_interval;

var map = iter.map;
var typeOf = is.typeOf;

var intervalId = null;

function* checkAndInvalidate(token) {
  var data = yield session.fget(token);

  if (data) {
    var ms = Date.now() - data.timestamp;

    if (!data.isValid || ms >= cleanupTime) {
      yield invalidate(token, data);
    }
  }
  else {
      yield invalidate(token, null);
  }

  return token;
}

function* invalidate(token, data) {
  yield store.del(token);
  process.emit('app:log', module, 'session daemon deleted: ' + token);

  //yield store.srem('token_set', token);
  //process.emit('app:log', module, 'deleted token: ' + token);

  if (data !== null) {
    data.isValid = false;
    bus.emit('session:expired', token, data);
  }
}

module.exports = exports = {
  cleanup: function* () {
    yield sleep(Math.floor(Math.random() * 1000));

    var cleanup = yield store.get('cleanup');

    if (cleanup === 'running') {
      process.emit('app:info', module, 'session daemon cleanup skipped');

      return;
    }

    yield store.set('cleanup', 'running');

    process.emit('app:info', module, 'session daemon cleanup starting');
    process.emit('app:time', module);

    //var tokens = yield store.smembers('token_set');
    var token, tokens = yield store.keys('*');

    if (Array.isArray(tokens) && tokens.length) {
      process.emit('app:info', module, 'session daemon checking ' + tokens.length + ' tokens');

      while (token = tokens.shift()) {
        yield checkAndInvalidate(token);
      }
      //yield map(tokens, co(checkAndInvalidate));
      //var expired = yield map(tokens, co(checkAndInvalidate));
      //expired = tokens = null;
    }

    process.emit('app:timeend', module);

    process.emit('app:info', module, 'session daemon cleanup finished');

    yield store.del('cleanup');

    return exports;
  },
  listen: function(cb) {
    if (typeof cb === 'function') {
      bus.on('session:expired', cb);
    }

    return exports;
  },
  start: function() {
    if (intervalId !== null) {
      exports.stop();
    }

    intervalId = defer.interval(exports.cleanup, cleanupInterval);

    process.emit('app:info', module, 'session daemon started');

    return exports;
  },
  stop: function() {
    clearInterval(intervalId);

    intervalId = null;

    process.emit('app:info', module, 'session daemon stopped');

    return exports;
  }
};

