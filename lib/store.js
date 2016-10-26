'use strict';
// store domain name, zone ID and digest for each dns record here to share
// between method calls

const store = new Map();

module.exports = {
  get: function (domain) {
    const result = store.get(domain);
    if(result){
      return Promise.resolve(result);
    }
    return Promise.reject();
  },
  set: function (domain, payload) {
    if((domain && payload) && !store.get(domain)){
      return Promise.resolve(store.set(domain, payload));
    }
    return Promise.reject();
  },
  remove: function (domain) {
    const result = store.get(domain);
    if(result){
      return Promise.resolve(store.delete(domain));
    }
    return Promise.reject();
  }
};
