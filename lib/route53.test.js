'use strict';
// TODO: use later.
// const proxyquire = require('proxyquire');
// const sinon = require('sinon');
const tape = require('tape');

const {
  route53BasePayload
} = require('./route53');

tape('module > route53 helpers', route53Test => {
  const expectedAction = 'foo';
  const expectedID = 'bar';
  const payload = route53BasePayload(expectedAction, expectedID);
  const {ChangeBatch: {Changes: [{Action: action}]}} = payload;
  const {HostedZoneId: id} = payload;
  route53Test.test(' * route53BasePayload', test => {
    test.equal(typeof payload, 'object', 'returns an object');
    test.equal(action, expectedAction, `payload action is ${action}`);
    test.equal(id, expectedID, `payload ID is ${id}`);
    test.end();
  });
});
