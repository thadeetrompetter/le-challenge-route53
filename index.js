'use strict';

const fs = require('fs');
const base64url = require('base64-url');
const AWS = require('aws-sdk');
const R = require('ramda');
const route53 = new AWS.Route53({apiVersion: '2013-04-01'});

const Challenge = module.exports;

const defaults = {
  debug: false,
  // _acme-challenge.example.com TXT xxxxxxxxxxxxxxxx
  acmeChallengeDns: '_acme-challenge.',
  AWSConfigFile: './config.json'
};

// store domain name, zone ID and digest for each dns record here to share
// between method calls
// TODO: consider persistent storage
const store = {
  getPayload: function (domain) {
    return Promise.resolve(this[domain] || null);
  },
  setPayload: function (domain, payload) {
    this[domain] = payload;
    return Promise.resolve();
  }
};

Challenge.create = function (options) {
  const opts = mergeOptions(defaults, options);

  // AWS authentication is loaded from config file if its path is provided and
  // the file exists.
  if(opts.AWSConfigFile && fs.existsSync(opts.AWSConfigFile)){
    // TODO: commented out while debugging
    // AWS.config.loadFromPath(opts.AWSConfigFile);
  }
  // Configure AWS api to return (native) promises
  AWS.config.setPromisesDependency(Promise);

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

function getChallengeDomain(domain) {
  return `_acme-challenge.${domain}`;
}
function getAWSConfig(location) {
  try {
    JSON.parse(fs.readFileSync(location));
  } catch(err) {
    return null;
  };
}

function mergeOptions(defaults, options) {
  return Object.assign({}, defaults, options);
}

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

function route53Payload(action, id, domain, value) {
    const payload = route53BasePayload(action, id);
    const {ChangeBatch: { Changes: [ change ] }} = payload;
    change.ResourceRecordSet = getResourceRecordSet(domain, [
      getValue(value)
    ]);
    return payload;
}

const route53CreatePayload = R.curry(route53Payload)('CREATE');
const route53DeletePayload = R.curry(route53Payload)('DELETE');

function getValue(value) {
    return { Value: `"${value}"`};
}

function getResourceRecordSet(domain, resourceRecords=[]) {
    return {
      Name: getChallengeDomain(domain),
      Type: 'TXT',
      TTL: 60,
      ResourceRecords: [...resourceRecords]
    };
}

function getZoneIDByName(DNSName) {
  // TODO: handle error
  return route53.listHostedZonesByName({ DNSName }).promise()
    .then(result => {
      // destructure to get to the id returned by listHostedZonesByName
      const { HostedZones: [ { Id: id } ] } = result;
      return id;
    });
}
Challenge.set = function (opts, domain, token, keyAuthorization, cb) {

  const keyAuthDigest = base64url.encode(keyAuthorization);
  if (!token || !keyAuthorization) {
    console.warn("SANITY FAIL: missing challenge or keyAuthorization", domain, challenge, keyAuthorization);
  }
  return getZoneIDByName(domain)
    .then(id => {
      const params = route53CreatePayload(id, domain, keyAuthDigest);
      return route53.changeResourceRecordSets(params)
        .promise()
        .then(() => store.setPayload(domain, {
          id,
          domain,
          value: keyAuthDigest
        }));
    })
    .catch(cb);
};
Challenge.get = function (opts, domain, token, cb) { /* Not to be implemented */ };
Challenge.remove = function (opts, domain, token, cb) {
  // TODO:
  // this might require something such as an id that needs to be retrieved from a database
  // ddnsFoo.remove(creds, prefixName(domain), "TXT", token, opts, cb);
  store.getPayload(domain)
    .then(({id, domain, value}) => {
      const params = route53DeletePayload(id, domain, value);
      return route53.changeResourceRecordSets(params).promise();
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
