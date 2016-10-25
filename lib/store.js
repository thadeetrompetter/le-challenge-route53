'use strict';
// store domain name, zone ID and digest for each dns record here to share
// between method calls

// TODO: consider persistent storage
module.exports = {
  getPayload: function (domain) {
    return Promise.resolve(this[domain] || null);
  },
  setPayload: function (domain, payload) {
    this[domain] = payload;
    return Promise.resolve();
  }
};
