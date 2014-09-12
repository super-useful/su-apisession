'use strict';
var path = require('path');

var co = require('co');
var cothunkify = require('co-thunkify');
var sleep = require('co-sleep');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var session = require(path.resolve('./'));
var modulePath = './cache';
var underTest = require(path.resolve(modulePath));
var sessionData = {
      elec: {accountNumber: '1234567890'},
      gas: {accountNumber: '1234567890'}
    };
var token;

chai.use(sinonChai);

describe('su-apisession/cache', function() {
  it('should cache a response if it\'s valid', cothunkify(function* () {
    token = yield session.set(sessionData);

    yield underTest.set.call({
      data : { foo : 'bar' },
      su : { req : {
        xcsrf : token
      } },
      request : {
        method : 'GET',
        url : '/foo/bar'
      },
      status : 200
    }, function* () {});

    var data = yield session.getCached(token, 'GET:/foo/bar');

    expect(data).to.deep.equal({ foo : 'bar' });
  }));

  it('should get the `cached` data on the context if there iseses one', cothunkify(function* () {
    var ctx = {
        su : { req : {
          xcsrf : token
        } },
        request : {
          method : 'GET',
          url : '/foo/bar'
        }
      };

    yield underTest.get.call(ctx, function* () {});

    expect(ctx.su.req.cached).to.deep.equal({ foo : 'bar' });
  }));
});
