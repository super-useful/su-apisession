var getenv = require('getenv');
var sentinel = require('redis-sentinel');

var Sentinel = sentinel.Sentinel([
      { host : '127.0.0.1', port : 27000 },
      { host : '127.0.0.1', port : 27001 },
      { host : '127.0.0.1', port : 27002 }
    ]);

var redisClient, store;

module.exports = {
  del : function* del(key) {
    var store = yield getValidStore;

    return yield store.del(key);
  },
  get : function* get(key) {
    var store = yield getValidStore;

    return yield store.get(key);
  },
  pexpire : function* pexpire(key, ms) {
    var store = yield getValidStore;

    return yield store.pexpire(key, ms);
  },
  smembers : function* smembers(key) {
    var store = yield getValidStore;

    return yield store.smembers(key);
  },
  srem : function* srem(key, value) {
    var store = yield getValidStore;

    return yield store.srem(key, value);
  },
  sadd : function* sadd(key, value) {
    var store = yield getValidStore;

    return yield store.sadd(key, value);
  },
  set : function* set(key, value) {
    var store = yield getValidStore;

    return yield store.set(key, value);
  }
};

function* getValidStore() {
  var ping;

  if (store && store.connected) {
    try {
      ping = yield store.get('ping');
      ping = String(ping).toLowerCase();
    } catch(e) {
      ping = 'WAH!!!';
    }
  }


  if (ping !== 'pong') {
    redisClient = Sentinel.createClient('megoat-session-web', {
      retry_max_delay : 20,
      connect_timeout : 200,
      max_attempts : 3
    });

    store = require('co-redis')(redisClient);

    yield store.set('ping', 'pong');

    process.emit('app:debug', module, 'NEW REDIS CLIENT CREATED!!!');
  }

  return store;
}
