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
var modulePath = './daemon';
var underTest = require(path.resolve(modulePath));
var sessionData = {
      elec: {accountNumber: '1234567890'},
      gas: {accountNumber: '1234567890'}
    };

chai.use(sinonChai);

describe('su-apisession/daemon', function() {

  it('should invalidate a token if it be timeded out', cothunkify(function* () {
    var token = yield session.set(sessionData);

    yield sleep(225);

    yield underTest.cleanup();

    yield sleep(225);

    expect(yield session.get(token)).to.be.null;

  }));

  it('should allow listeners to observe `session:expired` events expecting the goddamn session `token, data` as the callback args', cothunkify(function* () {
    var token = yield session.set(sessionData);
    var fired = false;
    underTest.listen(function(session, data) {
      if (fired === true) {
        return;
      }

      fired = true;

      expect(session).to.be.equal(token);

      expect(data).to.be.an.object;

      expect(data.isValid).to.be.false;
    });

    yield sleep(225);

    yield underTest.cleanup();

    yield sleep(225);

  }));

  it('should allow starting and stoping of the daemon', cothunkify(function* () {
    yield sleep(225);

    yield underTest.cleanup();

    yield sleep(225);

    var token = yield session.set(sessionData);

    underTest.listen(function(session, data) {
      expect(session).to.be.a.string;

      expect(data).to.be.an.object;
    });

    underTest.start();

    yield sleep(250);

    underTest.stop();

    expect(yield session.get(token)).to.be.null;

  }));

});
