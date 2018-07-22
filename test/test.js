import test from 'ava';
import keyvTestSuite, { keyvOfficialTests } from '@keyv/test-suite';
import Keyv from 'keyv';
import KeyvRedis from 'this';

const KeyvMemjs = require('../src/keyv-memjs');

keyvOfficialTests(test, Keyv, {
  store: new KeyvMemjs('memjs://localhost:11211')
}, {
  store: new KeyvMemjs('memjs://foo:11211')
});

const store = () => new KeyvRedis();
keyvTestSuite(test, Keyv, store);
