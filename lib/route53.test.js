'use strict';
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const tape = require('tape');

const hostedZonesResponse = {
  HostedZones: [
    { Id: 'zone-id' }
  ]
};

const route53 = proxyquire('./route53', {
  'aws-sdk': {
    Route53: sinon.stub().returns({
      listHostedZonesByName: sinon.stub().returns({
        promise: sinon.stub().returns(Promise.resolve(hostedZonesResponse))
      }),
      changeResourceRecordSets: sinon.stub().returns({
        promise: sinon.stub().returns(Promise.resolve())
      })
    }),
    config: {
      setPromisesDependency: sinon.spy()
    }
  }
});

const {
  changeResourceRecordSets,
  getZoneIDByName,
  formatValue,
  route53Payload
} = route53;


tape('module > route53 helpers', route53Test => {
  route53Test.test(' * route53Payload', test => {
    const expectedAction = 'foo';
    const expectedID = 'bar';
    const expectedDomain = 'foo.com';
    const expectedValue = '"token value"'; // enclosed in double quotes
    const payload = route53Payload(expectedAction, expectedID, expectedDomain, 'token value');
    const {ChangeBatch: {Changes: [{Action: action}]}} = payload;
    const {HostedZoneId: id} = payload;
    const {ChangeBatch: {Changes: [{ResourceRecordSet: rrset}]}} = payload;
    const {Name: domain} = rrset;
    const {ResourceRecords: records} = rrset;
    const [record] = records;
    const {Value: value} = record;

    test.equal(typeof payload, 'object', 'returns an object');
    test.equal(action, expectedAction, `payload action is ${action}`);
    test.equal(id, expectedID, `payload ID is ${id}`);
    test.equal(typeof rrset, 'object', 'ResourceRecordSet is an object');
    test.equal(domain, expectedDomain, `domain is ${expectedDomain}`);
    test.ok(Array.isArray(records), 'ResourceRecords is an Array');
    test.equal(records.length, 1, 'ResourceRecords contains one record');
    test.equal(typeof record, 'object', 'resource record is an object');
    test.equal(value, expectedValue, `token value is ${expectedValue}`);
    test.end();
  });
  route53Test.test(' * formatValue', test => {
    const input = 'foobar';
    const expectedValue = '"foobar"';
    const result = formatValue(input);
    const {Value:value} = result;
    test.equal(typeof result,'object', 'formatValue returns an object');
    test.ok('Value' in result, 'result has a "Value" property');
    test.equal(typeof value, 'string', '"Value" value is a string');
    test.equal(value, expectedValue, '"Value" value is enclosed in double quotes');
    test.end();
  });
  route53Test.test(' * getZoneIDByName', test => {
    test.plan(3);
    test.ok(getZoneIDByName('foo.com') instanceof Promise, 'returns a promise');
    getZoneIDByName('domain-name.com').then(id => {
      test.equal(id, 'zone-id', 'resolves promise with the Route53 zone id for given domain name');
    });
    getZoneIDByName().catch(() => {
      test.pass('not passing a domain name rejects the promise');
    });
  });
  route53Test.test(' * changeResourceRecordSets', test => {
    test.ok(changeResourceRecordSets({}) instanceof Promise, 'returns a promise');
    test.end();
  });
});
