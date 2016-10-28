'use strict';

const crypto = require('crypto');
const base64url = require('base64-url');

// TODO: document and test
function mergeOptions(defaults, options) {
  return Object.assign(defaults, options);
}
exports.mergeOptions = mergeOptions;

// TODO: document and test
function encrypt(key='') {
  return base64url.encode(
    crypto.createHash('sha256')
      .update(key)
      .digest()
    );
}
exports.encrypt = encrypt;

/**
 * TODO
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
exports.verifyParams = (params) => params.every(param => Boolean(param));

/**
 * TODO
 * @param  {[type]} prefix [description]
 * @param  {[type]} domain [description]
 * @return {[type]}        [description]
 */
exports.getChallengeDomain = (prefix, domain) => `${prefix}${domain}`;
