'use strict';
const tape = require('tape');
const key = 'foo';
const value = { prop: 'val' };

tape('module > store', test => {
  const store = require('./store');

  test.plan(6);

  store.get(key).catch(() => {
    test.pass('trying to get a non existent key');
  });

  store.set(key, value).then(() => {
    test.pass('set a key');
  });

  store.get(key).then((val) => {
    test.pass('get a key');
  });

  store.set(key, value).catch((val) => {
    test.pass('setting a key that has already been set');
  });

  store.remove(key).then(() => {
    test.pass('remove a key');
  });

  store.remove(key).catch(() => {
    test.pass('trying to remove a key that has already been removed');
  });
});
