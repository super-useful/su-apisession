var session = require('./');

module.exports = {
  get : function* getCached(next) {
    try {
      var data = yield session.getCached(this.su.req.xcsrf, this.request.method + ':' + this.request.url);

      if (data) {
        this.su.req.cached = data;
      }
    }
    catch (e) {
      process.emit('app:debug', module, JSON.stringify(e.stack));
    }

    yield next;
  },
  set : function* cacheResponse(next) {
    try {
      if (!this.su.req.cached && this.status === 200) {
        yield session.cache(this.su.req.xcsrf, this.request.method + ':' + this.request.url, this.data);
      }
    }
    catch (e) {
      process.emit('app:debug', module, JSON.stringify(e.stack));
    }

    yield next;
  }
};
