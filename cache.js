var CONF = require('config');
var session = require('./');

module.exports = {
  get : function* getCached(next) {
    if (CONF.app.session.memcache !== false) {
      var key = this.request.method + ':' + this.request.url;

      try {
        var data = yield session.getCached(this.su.req.xcsrf, key);

        if (data) {
          this.su.req.cached = data;

          process.emit('app:log', module, 'MEMCACHE:GET\t' + key);
        }
      }
      catch (e) {
        process.emit('app:debug', module, JSON.stringify(e.stack));
      }
    }

    yield next;
  },
  set : function* cacheResponse(next) {
    if (CONF.app.session.memcache !== false) {
      var key = this.request.method + ':' + this.request.url;

      try {
        if (!this.su.req.cached && this.status === 200) {
          yield session.cache(this.su.req.xcsrf, key, this.data);

          process.emit('app:log', module, 'MEMCACHE:SET\t' + key);
        }
      }
      catch (e) {
        process.emit('app:debug', module, JSON.stringify(e.stack));
      }
    }

    yield next;
  }
};
