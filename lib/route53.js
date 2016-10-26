'use strict';

const AWS = require('aws-sdk');
const R = require('ramda');
const route53 = new AWS.Route53({apiVersion: '2013-04-01'});

// Configure AWS api to return (native) promises
AWS.config.setPromisesDependency(Promise);

// TODO: document and test
function route53BasePayload(action, id) {
  return {
    ChangeBatch: {
      Changes: [{
        Action: action
      }]
    },
    HostedZoneId: id
  };
}
exports.route53BasePayload = route53BasePayload;

// TODO: document and test
function route53Payload(action, id, domain, value) {
  const payload = route53BasePayload(action, id);
  const {ChangeBatch: { Changes: [ change ] }} = payload;
  // TODO: use Array method
  change.ResourceRecordSet = getResourceRecordSet(domain, [
    formatValue(value)
  ]);
  return payload;
}
exports.route53Payload = route53Payload;

exports.route53CreatePayload = R.curry(route53Payload)('CREATE');
exports.route53DeletePayload = R.curry(route53Payload)('DELETE');

// TODO: document and test
function formatValue(value) {
    return { Value: `"${value}"`};
}
exports.formatValue = formatValue;

// TODO: document and test
function getChallengeDomain(prefix, domain) {
  return `${prefix}${domain}`;
}
exports.getChallengeDomain = getChallengeDomain;

// TODO: document and test
function getResourceRecordSet(domain, resourceRecords=[]) {
  return {
    Name: domain,
    Type: 'TXT',
    TTL: 60,
    ResourceRecords: [...resourceRecords]
  };
}
exports.getResourceRecordSet = getResourceRecordSet;

// TODO: document and test
function getZoneIDByName(DNSName) {
  // TODO: handle error
  return route53.listHostedZonesByName({ DNSName }).promise()
    .then(result => {
      // destructure to get to the id returned by listHostedZonesByName
      const { HostedZones: [ { Id: id } ] } = result;
      return id;
    });
}
exports.getZoneIDByName = getZoneIDByName;

// TODO: document and test
function changeResourceRecordSets(params) {
  return route53.changeResourceRecordSets(params)
    .promise();
}
exports.changeResourceRecordSets = changeResourceRecordSets;
