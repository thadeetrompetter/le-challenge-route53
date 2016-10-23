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

Challenge.set = function (args, domain, challenge, keyAuthorization, cb) {
  // TODO
};
Challenge.get = function () { /* TODO */ };
Challenge.remove = function () { /* TODO */ };
Challenge.loopback = function () { /* TODO */ };
