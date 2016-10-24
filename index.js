'use strict';

const Challenge = module.exports;
const route53 = new require('aws-sdk')
  .Route53({apiVersion: '2013-04-01'});

Challenge.create = function (defaults) {
  return {
    getOptions: function () {
      return defaults || {};
    },
    set: Challenge.set,
    get: Challenge.get,
    remove: Challenge.remove,
    loopback: Challenge.loopback,
    test: Challenge.test
  };
};

function route53Payload(action, domain, value, id) {
  return {
    ChangeBatch: {
      Changes: [{
        Action: action,
        ResourceRecordSet: {
          Name: getChallengeDomain(domain),
          Type: 'TXT',
          TTL: 60,
          ResourceRecords: [{
            Value: `"${value}"`
          }]
        }
      }]
    },
    HostedZoneId: id
  };
}
};
Challenge.get = function () { /* TODO */ };
Challenge.remove = function () { /* TODO */ };
Challenge.loopback = function () { /* TODO */ };
