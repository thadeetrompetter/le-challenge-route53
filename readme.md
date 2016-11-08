# le-challenge-route53 [![Build Status](https://travis-ci.org/thadeetrompetter/le-challenge-route53.svg?branch=master)](https://travis-ci.org/thadeetrompetter/le-challenge-route53)

An [ACME dns-01 challenge](https://tools.ietf.org/html/draft-ietf-acme-acme-01#section-7.5)
handler for [node-letsencrypt](https://github.com/Daplie/node-letsencrypt).

**Notice:** Currently in alpha state.

## install

```sh
npm install le-challenge-route53
```

## Usage

Options specific to this challenge plugin:

* `AWSConfigFile`: By default, [aws-sdk](https://www.npmjs.com/package/aws-sdk)
will try to read your AWS credentials from  `~/.aws/credentials`. Specifying
a valid path to an alternative credentials file allows you to override the
default behavior. Refer to [aws docs](http://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-json-file.html) for details.

* `delay`: Delay in milliseconds before allowing letsencrypt to query dns
records created by this plugin. Setting this property allows you to compensate
for lag in DNS propagation.

* `zone`: **required** Name of a Route53 hosted zone where your dns resource
records live. This is required to resolve a hosted zone ID from Route53.
This plugin supports certificate retrieval for domains within a single hosted
zone. If you need certificates for domains under different hosted zones, run
node-letsencrypt for each hosted zone.

```javascript
var leChallenge = require('le-challenge-route53').create({
  AWSConfigFile: '~/path/to/aws-config-file', // Optional alternative AWS credentials file to use.
  zone: 'example.com' // required
  delay: 20000, // ms to wait before allowing letsencrypt to check dns record (20000 ms is the default)
  debug: false
});

var LE = require('letsencrypt');

LE.create({
  server: LE.stagingServerUrl, // Change to LE.productionServerUrl in production
  challenge: leChallenge
});
```
