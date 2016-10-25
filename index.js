'use strict';

const fs = require('fs');
const base64url = require('base64-url');
const {
  getZoneIDByName,
  route53CreatePayload,
  route53DeletePayload,
  changeResourceRecordSets
} = require('./lib/route53');
const store = require('./lib/store');

const Challenge = module.exports;

const defaults = {
  debug: false,
  // _acme-challenge.example.com TXT xxxxxxxxxxxxxxxx
  acmeChallengeDns: '_acme-challenge.',
  AWSConfigFile: './config.json'
};

Challenge.create = function (options) {
  const opts = mergeOptions(defaults, options);

  // AWS authentication is loaded from config file if its path is provided and
  // the file exists.
  if(opts.AWSConfigFile && fs.existsSync(opts.AWSConfigFile)){
    // TODO: commented out while debugging
    // AWS.config.loadFromPath(opts.AWSConfigFile);
  }

  return {
    getOptions: function () {
      return Object.assign({}, defaults) ;
    },
    set: Challenge.set,
    get: Challenge.get,
    remove: Challenge.remove,
    loopback: Challenge.loopback,
    test: Challenge.test
  };
};

function mergeOptions(defaults, options) {
  return Object.assign({}, defaults, options);
}

Challenge.set = function (opts, domain, token, keyAuthorization, cb) {

  const keyAuthDigest = base64url.encode(keyAuthorization);
  if (!token || !keyAuthorization) {
    console.warn("SANITY FAIL: missing challenge or keyAuthorization", domain, token, keyAuthorization);
  }
  return getZoneIDByName(domain)
    .then(id => {
      const params = route53CreatePayload(id, domain, keyAuthDigest);
      return changeResourceRecordSets(params)
        .then(() => store.setPayload(domain, {
          id,
          domain,
          value: keyAuthDigest
        }));
    })
    .catch(cb);
};
/* eslint-disable no-unused-vars */
Challenge.get = function (opts, domain, token, cb) { /* Not to be implemented */ };
Challenge.remove = function (opts, domain, token, cb) {
  // TODO:
  // this might require something such as an id that needs to be retrieved from a database
  // ddnsFoo.remove(creds, prefixName(domain), "TXT", token, opts, cb);
  store.getPayload(domain)
    .then(({id, domain, value}) => {
      const params = route53DeletePayload(id, domain, value);
      return changeResourceRecordSets(params);
    })
    .catch(cb);
};
Challenge.loopback = function (opts, domain, token, cb) {
  // var name = '_debug_' + token + prefixName(domain);

  // test that we can actually set the domain record and that we can actually read it
  // ddnsFoo.set(creds, name, "TXT", token, opts, function (err, result) {
  //   dns.resolve(name, 'TXT', function (err, records) {
  //     // now test that token is in records
  //
  //     ddnsFoo.remove(creds, name, "TXT", token, opts, cb);
  //   });
  // });
};
/* eslint-enable no-unused-vars */
