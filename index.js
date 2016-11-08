'use strict';

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
  const zone = options.zone;
  if(typeof zone !== 'string'){
    throw new Error('Expected `options.zone` to be of type String');
  }
  const opts = mergeOptions(defaults, Object.assign(options, {
    // TODO: le-challenge-route53 currently supports only one hosted zone,
    // passed as an option. see https://github.com/thadeetrompetter/le-challenge-route53/issues/1
    hostedZone: getZoneIDByName(zone)
  }));
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
    remove: Challenge.remove
  };
};

Challenge.set = function (opts, domain, token, keyAuthorization, cb) {
  const keyAuthDigest = encrypt(keyAuthorization);
  const prefixedDomain = getChallengeDomain(opts.acmeChallengeDns, domain);
  return opts.hostedZone.then(id => {
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
