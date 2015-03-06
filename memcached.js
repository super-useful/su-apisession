var getenv = require('getenv');
var Memcached = require('memcached');
var thunkify = require('thunkify');

var MEMCACHED_PORT = getenv('MEMCACHED_PORT_6379_TCP_PORT', '11211');
var MEMCACHED_HOST = getenv('MEMCACHED_PORT_6379_TCP_ADDR', '127.0.0.1');
var ONE_WEEK = 60 * 60 * 24 * 7;

console.log('MEMCACHED CONNECTION: ' + MEMCACHED_HOST + ':' + MEMCACHED_PORT);

var store = new Memcached(MEMCACHED_HOST + ':' + MEMCACHED_PORT);

store.$del = thunkify(store.del);
store.$get = thunkify(store.get);
store.$set = thunkify(store.set);

module.exports = exports = {
  del : function* del(key) {
    return yield store.$del(key);
  },
  get : function* get(key) {
    return yield store.$get(key);
  },
  smembers : function* smembers(key) {
    var list = yield store.$get(key);

    if (list) {
      list = JSON.parse(list);
    }

    if (Array.isArray(list)) {
      return list;
    }

    yield exports.set(key, JSON.stringify([]));

    return [];
  },
  srem : function* srem(key, value) {
    var count = 0;
    var i;
    var list = yield store.$get(key);

    if (list) {
      list = JSON.parse(list);
    }

    if (Array.isArray(list)) {
      while ((i = list.indexOf(value)) > -1) {
        list.splice(i, 1);

        ++count;
      }

      if (count > 0) {
        yield exports.set(key, JSON.stringify(list));
      }
    }
    else {
      yield exports.set(key, JSON.stringify([]));
    }

    return count;
  },
  sadd : function* sadd(key, value) {
    var list = yield store.$get(key);


    value = Array.prototype.slice.call(1);

    if (list) {
      list = JSON.parse(list);
    }

    if (!Array.isArray(list)) {
      list = [];
    }

    list.push.apply(list, value);

    yield exports.set(key, JSON.stringify(list));

    return list.length;
  },
  set : function* set(key, value) {
    return yield store.$set(key, value, ONE_WEEK);
  }
};
