var getenv = require('getenv');
var redis = require('redis');

var REDIS_PORT = getenv('REDIS_PORT_6379_TCP_PORT', '6379');
var REDIS_HOST = getenv('REDIS_PORT_6379_TCP_ADDR', '127.0.0.1');

console.log('REDIS CONNECTION: ' + REDIS_HOST + ':' + REDIS_PORT);

var redisClient = redis.createClient(REDIS_PORT, REDIS_HOST);

var store = require('co-redis')(redisClient);

module.exports = {
  del : function* del(key) {
    return yield store.del(key);
  },
  get : function* get(key) {
    return yield store.get(key);
  },
  pexpire : function* pexpire(key, ms) {
    return yield store.pexpire(key, ms);
  },
  smembers : function* smembers(key) {
    return yield store.smembers(key);
  },
  srem : function* srem(key, value) {
    return yield store.srem(key, value);
  },
  sadd : function* sadd(key, value) {
    return yield store.sadd(key, value);
  },
  set : function* set(key, value) {
    return yield store.set(key, value);
  }
};
