/*

  session management

*/
"use strict";

var CONF = require('config');
var rack = require('hat').rack();
var store = require('./' + (CONF.app.session.type || 'redis'));
var SessionData = require('./lib/SessionData');

var SESSION_TIMEOUT = CONF.app.global_session_timeout;

function * getData (token, force) {

    try {

      var session = yield retrieve(token);

      if (!session || (!session.isValid && force !== true)) {

        return null;
      }

      if (Date.now() - session.timestamp > SESSION_TIMEOUT) {

        session.isValid = false;
        yield save(session);

        if (force !== true) {
          return null;
        }
      }

      if (force !== true) {
        session.timestamp = Date.now();

        yield save(session);
      }

      return session;
    }
    catch (e) {
      console.log('SessionTokenError: ', e.message);
      console.log(e.stack);

      return null;
    }
}

function * retrieve (token) {

  var data = yield store.get(token);

  if (!data) {
    return null;
  }

  return new SessionData(JSON.parse(data));
}


function * save (session) {

  var data = JSON.stringify(session.serialise());

  data = yield store.set(session.id, data);

  return data;
}


module.exports = exports = {
  cache: function * (token, key, data) {
    try {
      var session = yield getData(token);

      if (session) {
        session.cache[key] = data;

        yield save(session);

        return true;
      }
    }
    catch (e) {

      console.log(e.stack);
    }

    return false;
  },
  set: function * set (data) {

    try {

      var token = rack();
      var session = new SessionData({
        cache: {},
        data: data,
        id: token,
        timestamp: Date.now()
      });

      yield save(session);

      yield store.sadd('token_set', token);

      return token;
    }
    catch (e) {

      console.log(e.stack);
    }

    return null;
  },

  get: function * get (token) {
    return yield getData(token);
  },

  getCached: function * getCached(token, key) {
    try {
      var session = yield getData(token);

      var data = session && key in session.cache
               ? session.cache[key]
               : null;

      return data;
    }
    catch (e) {
      console.log(e.stack);
    }

    return null;
  },

  fget: function * fget (token) {
    return yield getData(token, true);
  },

  invalidate: function * invalidate (token) {

    try {

      var session = yield retrieve(token);

      session.isValid = false;
      session.cache = {};

      yield save(session);

      return true;
    }
    catch (e) {
      console.log('SessionTokenError: ', e.message);
      console.log(e.stack);
    }

    return false;
  },

  update: function * update (session) {

    try {
      if (session && session.isValid) {
        session.timestamp = Date.now();
      }

      yield save(session);

      return yield retrieve(session.id);
    }
    catch (e) {

      console.log(e.stack);
    }

    return null;
  }

};
