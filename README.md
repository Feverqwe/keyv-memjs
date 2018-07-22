> Memcached storage adapter for Keyv

Memcached storage adapter for [Keyv](https://github.com/lukechilds/keyv).

## Usage

```js
const Keyv = require('keyv');
const KeyvMemjs = require('./keyv-memjs');

const keyv = new Keyv({store: new KeyvMemjs('127.0.0.1:11211')});
keyv.on('error', handleConnectionError);
```

See source code for more information.
