'use strict';

const dns = require('dns');
const fs = require('fs');
const {
  changeResourceRecordSets,
  getZoneIDByName,
  route53Config,
  route53CreatePayload,
  route53DeletePayload,
} = require('./lib/route53');

const {
  encrypt,
  getChallengeDomain,
  mergeOptions
} = require('./lib/helpers');

const store = require('./lib/store');

const Challenge = module.exports;

const defaults = {
  debug: false,
  delay: 2e4,
  acmeChallengeDns: '_acme-challenge.'
};

Challenge.create = function (options) {
  const opts = mergeOptions(defaults, options);
  // AWS authentication is loaded from config file if its path is provided and
  // the file exists.
  if(opts.AWSConfigFile && fs.existsSync(opts.AWSConfigFile)){
    route53Config.loadFromPath(opts.AWSConfigFile);
  }

  return {
    getOptions: function () {
      return Object.assign({}, defaults);
    },
    set: Challenge.set,
    get: Challenge.get,
    remove: Challenge.remove,
    loopback: Challenge.loopback
  };
};

Challenge.set = function (opts, domain, token, keyAuthorization, cb) {
  const keyAuthDigest = encrypt(keyAuthorization);
  if (!token || !keyAuthorization) {
    console.warn("SANITY FAIL: missing challenge or keyAuthorization", domain, token, keyAuthorization);
  }
  return getZoneIDByName(domain)
    .then(id => {
      const prefixedDomain = getChallengeDomain(opts.acmeChallengeDns, domain);
      const params = route53CreatePayload(id, prefixedDomain, keyAuthDigest);
      return changeResourceRecordSets(params)
        .then(() => store.set(domain, {
          id,
          domain,
          value: keyAuthDigest
        }));
    })
    .then(() => {
      setTimeout(cb, opts.delay, null);
    })
    .catch(cb);
};
/* eslint-disable no-unused-vars */
Challenge.get = function (opts, domain, token, cb) { /* Not to be implemented */ };
/* eslint-enable no-unused-vars */
Challenge.remove = function (opts, domain, token, cb) {
  store.get(domain)
    .then(({id, domain, value}) => {
      const prefixedDomain = getChallengeDomain(opts.acmeChallengeDns, domain);
      const params = route53DeletePayload(id, prefixedDomain, value);
      return changeResourceRecordSets(params)
        .then(() => store.remove(domain));
    })
    .then(() => {
      cb(null);
    })
    .catch(cb);
};
Challenge.loopback = function (opts, domain, token, cb) {
  const challengeDomain = getChallengeDomain()
  dns.resolveTxt(challengeDomain, (err, records) => {
    if(err){
      cb(err);
    }
    const [[record]] = records;
    cb(null, record);
  });
};
